import { PrismaClient } from "@prisma/client";
import prisma from "../../config/datasource";

import { validateDate } from "../../utils/time";

import Logger from "../../config/logtape";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionResponse,
    MessageComponentInteraction,
    MessageFlags,
    RepliableInteraction,
} from "discord.js";

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
import { privateReply } from "../../utils/reply";
import Crew from "../../entities/crew";

export default class VesselService {
    private readonly DEFAULT_DESCRIPTION = "설명이 없습니다.";

    private readonly client: PrismaClient;
    private readonly alarmsRepository;
    private readonly crewRepository;
    private readonly vesselRepository;
    private readonly log = Logger(["bot", "VesselService"]);

    public constructor() {
        this.client = prisma;
        this.alarmsRepository = new AlarmRepository(this.client);
        this.crewRepository = new CrewRepository(this.client);
        this.vesselRepository = new VesselRepository(this.client);
    }

    // 건조
    public createVessel = async (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> => {
        const channelId = interaction.channelId;
        let alarmTime = interaction.options.getString("출항시간");
        let canMidParticipation: boolean | string | null = interaction.options.getBoolean("중참가능여부");

        if (alarmTime !== null) {
            // 출항 시간에 대한 유효성 검증
            const [valid, message] = validateDate(alarmTime);

            if (!valid) {
                return privateReply(
                    interaction,
                    message ?? "출항 시간이 유효하지 않습니다. HH:MM 형식으로 입력해주세요.",
                );
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

        const vesselName = interaction.options.getString("선명")!;
        const vesselCapacity = interaction.options.getInteger("인원수")!;
        const vesselDescription = interaction.options.getString("설명") ?? this.DEFAULT_DESCRIPTION;
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
            return privateReply(interaction, "이미 존재하는 어선입니다.");
        }

        /*
         * 서버 이름을 기본적으로 가져오고, 해당 값이 없으면 전역 프로필 이름 -> 기본 이름 순으로 가져온다
         * (interaction.user.username은 계정이 생성될 때 부여되는 unique한 값이다)
         */
        const username = interaction.user?.displayName ?? interaction.user?.globalName ?? interaction.user.username;
        const captain = new CrewEntity(interaction.user.id, interaction.user.username, username);

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

                if (v === null) {
                    throw new Error("어선 생성에 실패했습니다.");
                }

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

            return privateReply(interaction, "어선 생성에 실패했습니다.");
        }

        const vesselEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(savedVessel.name)
            .setDescription(savedVessel.description)
            .addFields(
                { name: "인원수", value: `총 ${savedVessel.capacity}명` },
                {
                    name: "출항시간",
                    value: alarmTime ? `${alarmTime.substring(0, 2)}:${alarmTime.substring(2, 4)}` : "설정되지 않음",
                },
                {
                    name: "중도참여 가능여부",
                    value: savedVessel.canMidParticipation === "Y" ? "가능" : "불가능",
                },
            )
            .setTimestamp(new Date())
            .setFooter({ text: "어선 생성 완료!" });
        const embarkButton = new ButtonBuilder()
            .setCustomId("embark_" + savedVessel.name)
            .setLabel("탑승하기")
            .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(embarkButton);

        return interaction.reply({ embeds: [vesselEmbed], components: [row] });
    };

    // 침몰
    public sinking = async (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> => {
        const clientId = interaction.user.id;
        const vesselName = interaction.options.getString("선명")!;
        const channelId = interaction.channelId;

        // 어선 조회
        const vessel = await this.vesselRepository.findByNameAndChannelId(vesselName, channelId);
        if (vessel === null) {
            return privateReply(interaction, "해당 어선이 존재하지 않습니다.");
        }

        if (!(await this.crewRepository.isCaptain(clientId, vessel.id))) {
            return privateReply(interaction, "어선의 선장만 침몰시킬 수 있습니다.");
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

            privateReply(interaction, "어선이 침몰하지 않았습니다.");
        }

        const vesselEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(vesselName)
            .setDescription("어선이 침몰되었습니다!")
            .setTimestamp(new Date())
            .setFooter({ text: "꼬르륵!" });

        return interaction.reply({ embeds: [vesselEmbed] });
    };

    // 목록
    public searchVessels = async (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> => {
        const channelId = interaction.channelId;
        const vessels = await this.vesselRepository.findByChannelId(channelId);
        if (vessels.length === 0) {
            return privateReply(interaction, "어선이 존재하지 않습니다.");
        }

        const vesselEmbeds = vessels.map((vessel) =>
            new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(vessel.name)
                .setDescription(vessel.description)
                .addFields({ name: "인원수", value: `총 ${vessel.capacity}명` }),
        );

        return privateReply(interaction, vesselEmbeds);
    };

    // 선원목록
    public searchCrewsInVessel = async (
        interaction: ChatInputCommandInteraction,
    ): Promise<InteractionResponse<boolean>> => {
        const vesselName = interaction.options.getString("선명")!;
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

        const crewsEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(vesselName)
            .setDescription("선원목록")
            .addFields({
                name: "탑승인원",
                value: crewMentions,
            });

        return privateReply(interaction, [crewsEmbed]);
    };

    // 승선
    public embark = async (
        interaction: ChatInputCommandInteraction | MessageComponentInteraction,
    ): Promise<InteractionResponse<boolean>> => {
        const crewId = interaction.user.id;
        const crewName = interaction.user.username;
        const crewGlobalName = interaction.user?.displayName ?? interaction.user?.globalName ?? crewName;
        const channelId = interaction.channelId;
        let vesselName;
        if (interaction.isChatInputCommand()) {
            vesselName = interaction.options.getString("선명");
        } else if (interaction.isMessageComponent()) {
            vesselName = interaction.customId.replace("embark_", "");
        }

        if (!vesselName) {
            return privateReply(interaction as RepliableInteraction, "해당하는 어선명을 찾을 수 없습니다.");
        }

        // 어선 조회
        const vessel = await this.vesselRepository.findByNameAndChannelId(vesselName, channelId);
        if (vessel === null) {
            return privateReply(interaction as RepliableInteraction, "해당 어선이 존재하지 않습니다.");
        }

        // 어선 탑승여부 확인
        const isExists = await this.crewRepository.isExistsOnVessel(crewId, vessel.id);
        if (isExists) {
            return privateReply(interaction as RepliableInteraction, "이미 해당 어선에 탑승하고 있습니다.");
        }

        const crews = await this.crewRepository.findCrewsOnVesselByVesselId(vessel.id);
        if (crews.length >= vessel.capacity) {
            return privateReply(interaction as RepliableInteraction, "어선의 정원이 초과되었습니다.");
        }

        if (vessel.canMidParticipation === "N") {
            const alarmTime = await this.alarmsRepository.findByVesselId(vessel.id);
            if (alarmTime !== null) {
                const now = new Date();
                const nowHHMM = now.getHours() * 100 + now.getMinutes();

                if (nowHHMM >= Number.parseInt(alarmTime.alarmTime)) {
                    return privateReply(
                        interaction as RepliableInteraction,
                        "어선의 출항시간이 지나서 승선할 수 없습니다!",
                    );
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

            const newCrew: Crew = {
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

            return privateReply(interaction as RepliableInteraction, "어선 승선에 실패했습니다.");
        } finally {
            this.client.$disconnect();
        }

        const vesselEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(vesselName)
            .setFields({ name: "승선한 선원", value: `${crewGlobalName}` })
            .setDescription("승선 완료!")
            .setTimestamp(new Date())
            .setFooter({ text: "어선 승선 완료!" });

        const embarkButton = new ButtonBuilder()
            .setCustomId("embark_" + vesselName)
            .setLabel("탑승하기")
            .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(embarkButton);

        return interaction.reply({ embeds: [vesselEmbed], components: [row] });
    };

    // 하선
    public disembark = async (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> => {
        const crewId = interaction.user.id;
        const vesselName = interaction.options.getString("선명")!;
        const channelId = interaction.channelId;

        const crew = await this.crewRepository.findCrewOnVesselById(vesselName, channelId, crewId);
        if (crew === null) {
            return privateReply(interaction, "해당 어선에 탑승하고 있지 않습니다.");
        }

        let isCaptain = false;
        try {
            await this.client.$transaction(async (tx) => {
                const txAlarmRepository = new AlarmRepository(tx as PrismaClient);
                const txCrewRepository = new CrewRepository(tx as PrismaClient);
                const txVesselRepository = new VesselRepository(tx as PrismaClient);
                const txVesselCrewRepository = new VesselCrewRepository(tx as PrismaClient);

                const vessel = await txVesselRepository.findByNameAndChannelId(vesselName, channelId);

                if (vessel === null) {
                    return privateReply(interaction, "해당 어선이 존재하지 않습니다.");
                }

                // 어선 하선
                await txVesselCrewRepository.delete(crew.id, vessel.id);

                this.log.debug(`crew.id: ${crew.id}`);
                this.log.debug(`crew.vessels[0] crewId: ${crew.vessels[0].crewId}`);
                this.log.debug(`crew.vessels[0] vesselId: ${crew.vessels[0].vesselId}`);
                this.log.debug(`crew.vessels[0] position: ${crew.vessels[0].position}`);

                if (crew.vessels[0].position === "선장") {
                    this.log.debug("현재 유저의 역할이 선장입니다. 어선도 같이 침몰합니다.");

                    isCaptain = true;

                    // 모든 선원 삭제
                    const allCrews = await txCrewRepository.findMany(vesselName, channelId);
                    if (allCrews.length > 0) {
                        await txVesselCrewRepository.deleteMany(allCrews);
                    }

                    this.log.debug("모든 유저를 삭제했습니다.");

                    // 알람 삭제
                    const allAlarms = await txAlarmRepository.findMany(vesselName, channelId);
                    if (allAlarms) {
                        const deleteConditions = allAlarms.map((alarm) => ({
                            vesselId: alarm.vesselId,
                            alarmTime: alarm.alarmTime,
                        }));

                        // deleteMany를 사용하여 삭제
                        await txAlarmRepository.deleteMany(deleteConditions);
                    }

                    this.log.debug("모든 알람을 삭제했습니다.");

                    // 어선 삭제
                    await txVesselRepository.deleteMany(vesselName, channelId);

                    this.log.debug("어선을 삭제했습니다.");
                }
            });
        } catch (err) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }

            return privateReply(interaction, "어선 하선에 실패했습니다.");
        } finally {
            await this.client.$disconnect();
        }

        const vesselEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(vesselName)
            .setDescription("하선 완료!")
            .setTimestamp(new Date())
            .setFooter({ text: "어선 하선 완료!" });

        // 선장이 하선한 경우, 어선이 침몰되었다고 추가로 알림
        if (isCaptain) {
            const vesselEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(vesselName)
                .setDescription("어선이 침몰되었습니다!")
                .setTimestamp(new Date())
                .setFooter({ text: "꼬르륵!" });

            if (!interaction.channel?.isTextBased() || !("send" in interaction.channel)) {
                return privateReply(interaction, "채널에 메시지를 보낼 수 없습니다.");
            }

            await interaction.channel.send({ embeds: [vesselEmbed] });
        }

        return interaction.reply({ embeds: [vesselEmbed], flags: MessageFlags.Ephemeral });
    };

    // 호출
    public callingSailor = async (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> => {
        const channel = interaction.channel;
        const channelId = interaction.channelId;
        const vesselName = interaction.options.getString("선명")!;

        // 어선에 탑승한 선원들 조회
        const crews = await this.crewRepository.findCrewsOnVessel(vesselName, channelId);
        if (crews.length === 0) {
            return privateReply(interaction, "해당 어선에 탑승한 선원이 없습니다.");
        }

        const crewIds = crews.map((crew) => crew.id);
        let userMentions = crewIds.map((userId) => `<@${userId}>`).join(", ");
        userMentions = userMentions + ` 선원들! 지금 당장 ${vesselName} 어선에 탑승하시오!`;

        if (!channel?.isTextBased() || !("send" in channel)) {
            return privateReply(interaction, "채널에 메시지를 보낼 수 없습니다.");
        }
        await channel.send(userMentions);

        return privateReply(interaction, "어선에 탑승한 인원들에게 알림을 보냈습니다.");
    };

    // 오래된 어선 정리
    public cleanOldVessels = async (): Promise<void> => {
        // 7일 이상 된 vessels를 삭제
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        try {
            await this.client.$transaction(async (tx) => {
                const txVesselRepository = new VesselRepository(tx as PrismaClient);
                const vessels = await txVesselRepository.findSevenDaysOldVessels();
                await txVesselRepository.deleteAll(vessels);
            });

            this.log.info("오래된 어선이 성공적으로 정리되었습니다.");
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }
        } finally {
            await this.client.$disconnect();
        }
    };

    // 어선명 자동완성
    public getAllVessels = async (
        vesselsName: string,
        channelId: string,
        crewId?: string,
        position?: string,
    ): Promise<string[]> => {
        return await this.vesselRepository.findVesselsName(vesselsName, channelId, crewId, position);
    };
}
