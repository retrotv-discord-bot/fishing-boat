import { PrismaClient } from "@prisma/client";
import prisma from "../../config/datasource";

import { validateDate } from "../../utils/time";

import Logger from "../../config/logtape";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";

import { digestSha3512 } from "../../utils/cryptography";
import VesselRepository from "../../repositories/vessel.repository";
import AlarmRepository from "../../repositories/alarm.repository";
import CrewRepository from "../../repositories/crew.repository";
import CrewEntity from "../../entities/crew.entity";
import AlarmEntity from "../../entities/alarm.entity";
import Vessel from "../../entities/vessel";
import VesselEntity from "../../entities/vessel.entity";
import VesselCrewRepository from "../../repositories/vesselCrew.repository";
import VesselCrewEntity from "../../entities/vesselCrew.entity";

export default class ShipService {
    private readonly client: PrismaClient;
    private readonly alarmsRepository;
    private readonly crewRepository;
    private readonly vesselRepository;
    private readonly log = Logger(["bot", "ShipService"]);

    public constructor() {
        this.client = prisma;
        this.alarmsRepository = new AlarmRepository(this.client);
        this.crewRepository = new CrewRepository(this.client);
        this.vesselRepository = new VesselRepository(this.client);
    }

    // 건조
    public createShip = async (interaction: any): Promise<void> => {
        const channelId = interaction.channelId;
        let alarmTime = interaction.options.getString("출항시간");
        let canMidParticipation = interaction.options.getBoolean("중참가능여부");

        if (alarmTime !== null) {
            // 출항 시간에 대한 유효성 검증
            const [valid, message] = validateDate(alarmTime);

            if (!valid) {
                return interaction.reply({
                    content: message,
                    flags: MessageFlags.Ephemeral,
                });
            }

            alarmTime = alarmTime?.replaceAll(" ", "");
            alarmTime = alarmTime?.replaceAll(":", "");
        }

        // 중참여부 조정
        let cmp: boolean = true;
        if (alarmTime !== null && canMidParticipation !== null) {
            cmp = canMidParticipation;
        }

        canMidParticipation = cmp ? "Y" : "N";

        const vesselName = interaction.options.getString("선명");
        const vesselCapacity = interaction.options.getInteger("인원수");
        const vesselDescription = interaction.options.getString("설명") ?? "설명이 없습니다.";
        const newVessel: Vessel = new VesselEntity(
            digestSha3512(vesselName + channelId),
            vesselName,
            channelId,
            vesselCapacity,
            vesselDescription,
            canMidParticipation,
        );

        // 동일한 채널에 같은 이름의 어선이 존재하는지 확인
        if (await this.vesselRepository.isExists(newVessel.name, channelId)) {
            return interaction.reply({
                content: "이미 존재하는 어선입니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const captain = new CrewEntity(interaction.user.id, interaction.user.username, interaction.user.globalName);

        let alarm: AlarmEntity | null = null;
        if (alarmTime !== null) {
            alarm = new AlarmEntity(newVessel.id, alarmTime, "Y");
        }

        let savedVessel;
        try {
            savedVessel = await this.client.$transaction(async (tx) => {
                const txAlarmRepository = new AlarmRepository(tx as PrismaClient);
                const txCrewRepository = new CrewRepository(tx as PrismaClient);
                const txVesselRepository = new VesselRepository(tx as PrismaClient);
                const txVesselCrewRepository = new VesselCrewRepository(tx as PrismaClient);

                const v = await txVesselRepository.save(newVessel);
                await txCrewRepository.save(captain);

                // 3. VesselCrew 관계 저장 (선장으로 등록)
                await txVesselCrewRepository.save(new VesselCrewEntity(v.id, captain.id, "선장"));

                // 4. 알람 저장 (선택적)
                if (alarm !== null) {
                    await txAlarmRepository.save(alarm);
                }

                return v;
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }

            return interaction.reply({
                content: "어선 생성에 실패했습니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const vesselEmbed = {
            color: 0x0099ff,
            title: savedVessel.name,
            description: savedVessel.description,
            fields: [
                {
                    name: "인원수",
                    value: `총 ${savedVessel.capacity}명`,
                },
                {
                    name: "출항시간",
                    value: alarmTime ? `${alarmTime.substring(0, 2)}:${alarmTime.substring(2, 4)}` : "설정되지 않음",
                },
                {
                    name: "중도참여 가능여부",
                    value: savedVessel.canMidParticipation === "Y" ? "가능" : "불가능",
                },
            ],
            timestamp: new Date(),
            footer: {
                text: "어선 생성 완료!",
            },
        };
        const embarkButton = new ButtonBuilder()
            .setCustomId("embark_" + savedVessel.name)
            .setLabel("탑승하기")
            .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(embarkButton);

        return interaction.reply({ embeds: [vesselEmbed], components: [row] });
    };

    // 침몰
    public sinking = async (interaction: any): Promise<void> => {
        const clientId = interaction.user.id;
        const vesselName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const vessel = await this.vesselRepository.findByNameAndChannelId(vesselName, channelId);
        if (vessel === null) {
            return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", flags: MessageFlags.Ephemeral });
        }

        if (!(await this.crewRepository.isCaptain(clientId, vessel.id))) {
            return interaction.reply({ content: "어선의 선장만 침몰시킬 수 있습니다.", flags: MessageFlags.Ephemeral });
        }

        // 어선 삭제
        try {
            await this.client.$transaction(async (tx) => {
                const txVesselRepository = new VesselRepository(tx as PrismaClient);
                await txVesselRepository.deleteVessel(vessel.id);
            });

            this.log.info("어선이 성공적으로 침몰되었습니다.");
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }

            return interaction.reply({ content: "어선이 침몰하지 않았습니다.", flags: MessageFlags.Ephemeral });
        }

        const vesselEmbed = {
            color: 0x0099ff,
            title: vesselName,
            description: "어선이 침몰되었습니다!",
            timestamp: new Date(),
            footer: {
                text: "꼬르륵!",
            },
        };

        return interaction.reply({ embeds: [vesselEmbed] });
    };

    // 목록
    public searchShips = async (interaction: any): Promise<void> => {
        const channelId = interaction.channelId;
        const vessels = await this.vesselRepository.findByChannelId(channelId);
        if (vessels.length === 0) {
            return interaction.reply({ content: "어선이 존재하지 않습니다.", flags: MessageFlags.Ephemeral });
        }

        const shipEmbeds = vessels.map((vessel) => ({
            color: 0x0099ff,
            title: vessel.name,
            description: vessel.description,
            fields: [
                {
                    name: "인원수",
                    value: `총 ${vessel.capacity}명`,
                },
            ],
        }));

        return interaction.reply({ embeds: shipEmbeds, flags: MessageFlags.Ephemeral });
    };

    // 선원목록
    public searchCrewsInShip = async (interaction: any): Promise<void> => {
        const vesselName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const vessel = await this.vesselRepository.findByNameAndChannelId(vesselName, channelId);
        if (vessel === null) {
            return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", flags: MessageFlags.Ephemeral });
        }

        // 어선에 탑승한 선원들 조회
        const crews = await this.crewRepository.findCrewsOnVesselByVesselId(vessel.id);

        if (crews.length === 0) {
            return interaction.reply({ content: "해당 어선에 탑승한 선원이 없습니다.", flags: MessageFlags.Ephemeral });
        }

        const crewsName = crews.map((crew) => crew.globalName);
        const crewMentions = crewsName.map((crewName) => `${crewName}`).join("\n");

        const crewsEmbed = {
            color: 0x0099ff,
            title: vesselName,
            description: "선원목록",
            fields: [
                {
                    name: "탑승인원",
                    value: crewMentions,
                },
            ],
        };

        return interaction.reply({ embeds: [crewsEmbed], flags: MessageFlags.Ephemeral });
    };

    // 승선
    public embark = async (interaction: any): Promise<void> => {
        const crewId = interaction.user.id;
        const crewName = interaction.user.username;
        const crewGlobalName = interaction.user.globalName;
        const channelId = interaction.channelId;
        let vesselName;
        try {
            vesselName = interaction.options.getString("선명");
        } catch (err) {
            vesselName = interaction.customId.replace("embark_", "");
        }

        if (!vesselName) {
            return interaction.reply({
                content: "해당하는 어선명을 찾을 수 없습니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        // 어선 조회
        const vessel = await this.vesselRepository.findByNameAndChannelId(vesselName, channelId);
        if (vessel === null) {
            return interaction.reply({
                content: "해당 어선이 존재하지 않습니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        // 어선 탑승여부 확인
        const isExists = await this.crewRepository.isExistsOnVessel(crewId, vessel.id);
        if (isExists) {
            return interaction.reply({
                content: "이미 해당 어선에 탑승하고 있습니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const crews = await this.crewRepository.findCrewsOnVesselByVesselId(vessel.id);
        if (crews.length >= vessel.capacity) {
            return interaction.reply({
                content: "어선의 정원이 초과되었습니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (vessel.canMidParticipation === "N") {
            const alarmTime = await this.alarmsRepository.findByVesselId(vessel.id);
            if (alarmTime !== null) {
                const now = new Date();
                const nowHHMM = now.getHours() * 100 + now.getMinutes();

                if (nowHHMM >= Number.parseInt(alarmTime.alarmTime)) {
                    return interaction.reply({
                        content: "어선의 출항시간이 지나서 승선할 수 없습니다!",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
        }

        try {
            this.log.debug("===== 어선 승선 시작 =====");
            this.log.debug(`유저 ID: ${crewId}`);
            this.log.debug(`유저 이름: ${crewName}`);
            this.log.debug(`유저 글로벌 이름: ${crewGlobalName}`);
            this.log.debug(`어선 ID: ${vessel.id}`);
            this.log.debug("유저 역할: 선원");

            const newCrew = {
                id: crewId,
                name: crewName,
                globalName: crewGlobalName,
            };

            await this.client.$transaction(async (tx) => {
                const txCrewRepository = new CrewRepository(tx as PrismaClient);
                await txCrewRepository.embarkCrew(newCrew, vessel.id);
            });

            this.log.debug("===== 어선 승선 완료 =====");
        } catch (err) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }

            return interaction.reply({
                content: "어선 승선에 실패했습니다.",
                flags: MessageFlags.Ephemeral,
            });
        } finally {
            this.client.$disconnect();
        }

        const shipEmbed = {
            color: 0x0099ff,
            title: vesselName,
            description: "승선 완료!",
            timestamp: new Date(),
            footer: {
                text: "어선 승선 완료!",
            },
        };

        return interaction.reply({ embeds: [shipEmbed] });
    };

    // 하선
    public disembark = async (interaction: any): Promise<void> => {
        const crewId = interaction.user.id;
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        const crew = await this.client.crews.findUnique({
            where: {
                id: crewId,
                vessels: {
                    some: {
                        vessel: {
                            name: shipName,
                            channelId: channelId,
                        },
                    },
                },
            },
            include: {
                vessels: true,
            },
        });

        if (crew === null) {
            return interaction.reply({
                content: "해당 어선에 탑승하고 있지 않습니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        let isCaptain = false;
        try {
            await this.client.$transaction(async (tx) => {
                const vessel = await this.vesselRepository.findByNameAndChannelId(shipName, channelId);

                if (vessel === null) {
                    return interaction.reply({
                        content: "해당 어선이 존재하지 않습니다.",
                        flags: MessageFlags.Ephemeral,
                    });
                }

                // 어선 하선
                await tx.vesselsCrews.delete({
                    where: {
                        vesselId_crewId: {
                            vesselId: vessel.id,
                            crewId: crew.id,
                        },
                    },
                });

                if (crew.vessels[0].position === "선장") {
                    this.log.info("현재 유저의 역할이 선장입니다. 어선도 같이 침몰합니다.");

                    isCaptain = true;

                    // 모든 선원 삭제
                    const allCrews = await tx.crews.findMany({
                        where: {
                            vessels: {
                                some: {
                                    vessel: {
                                        name: shipName,
                                        channelId: channelId,
                                    },
                                },
                            },
                        },
                        include: {
                            vessels: true,
                        },
                    });
                    if (allCrews.length > 0) {
                        await tx.vesselsCrews.deleteMany({
                            where: {
                                crewId: {
                                    in: allCrews.map((crew) => crew.id),
                                },
                            },
                        });
                    }

                    this.log.debug("모든 유저를 삭제했습니다.");

                    // 알람 삭제
                    const allAlarms = await tx.alarms.findMany({
                        where: {
                            vessel: {
                                name: shipName,
                                channelId: channelId,
                            },
                        },
                    });
                    if (allAlarms) {
                        const deleteConditions = allAlarms.map((alarm) => ({
                            vesselId: alarm.vesselId,
                            alarmTime: alarm.alarmTime,
                        }));

                        // deleteMany를 사용하여 삭제
                        await tx.alarms.deleteMany({
                            where: {
                                OR: deleteConditions.map((condition) => ({
                                    vesselId: condition.vesselId,
                                    alarmTime: condition.alarmTime,
                                })),
                            },
                        });
                    }

                    this.log.debug("모든 알람을 삭제했습니다.");

                    // 어선 삭제
                    await tx.vessels.deleteMany({
                        where: {
                            name: shipName,
                            channelId: channelId,
                        },
                    });

                    this.log.debug("어선을 삭제했습니다.");
                }
            });
        } catch (err) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }
            return interaction.reply({
                content: "어선 하선에 실패했습니다.",
                flags: MessageFlags.Ephemeral,
            });
        } finally {
            await this.client.$disconnect();
        }

        const shipEmbed = {
            color: 0x0099ff,
            title: shipName,
            description: "하선 완료!",
            timestamp: new Date(),
            footer: {
                text: "어선 하선 완료!",
            },
        };

        // 선장이 하선한 경우, 어선이 침몰되었다고 추가로 알림
        if (isCaptain) {
            const shipEmbed = {
                color: 0x0099ff,
                title: shipName,
                description: "어선이 침몰되었습니다!",
                timestamp: new Date(),
                footer: {
                    text: "꼬르륵!",
                },
            };

            interaction.channel.send({ embeds: [shipEmbed] });
        }

        return interaction.reply({ embeds: [shipEmbed], flags: MessageFlags.Ephemeral });
    };

    // 호출
    public callingSailor = async (interaction: any): Promise<void> => {
        const channel = interaction.channel;
        const channelId = interaction.channelId;
        const shipName = interaction.options.getString("선명");

        // 어선에 탑승한 선원들 조회
        const crews = await this.crewRepository.findCrewsOnVessel(shipName, channelId);
        if (crews.length === 0) {
            return interaction.reply({
                content: "해당 어선에 탑승한 선원이 없습니다.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const crewIds = crews.map((crew) => crew.id);
        let userMentions = crewIds.map((userId) => `<@${userId}>`).join(", ");
        userMentions = userMentions + ` 선원들! 지금 당장 ${shipName} 어선에 탑승하시오!`;

        channel.send(userMentions);
        return interaction.reply({
            content: "어선에 탑승한 인원들에게 알림을 보냈습니다.",
            flags: MessageFlags.Ephemeral,
        });
    };

    // 어선명 자동완성
    public getAllShips = async (
        shipsName: string,
        channelId: string,
        crewId?: string,
        position?: string,
    ): Promise<string[]> => {
        return await this.vesselRepository.findVesselsName(shipsName, channelId, crewId, position);
    };
}
