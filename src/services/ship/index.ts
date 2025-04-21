/* eslint-disable @typescript-eslint/no-explicit-any */
import { begin, commit, rollback, release } from "../../config/datasource";

import AlarmRepository from "../../repositories/alarm.repository";
import CrewRepository from "../../repositories/crew.repository";
import ShipRepository from "../../repositories/ship.repository";

import { validateDate } from "../../utils/time";
import Ship from "../../entities/ship";
import Crew from "../../entities/crew";
import Alarm from "../../entities/alarm";

import Logger from "../../config/logtape";

export default class ShipService {
    private readonly log = Logger(["bot", "ShipService"]);
    private readonly alarmRepository: AlarmRepository;
    private readonly crewRepository: CrewRepository;
    private readonly shipRepository: ShipRepository;

    constructor() {
        this.alarmRepository = new AlarmRepository();
        this.crewRepository = new CrewRepository();
        this.shipRepository = new ShipRepository();
    }

    public createShip = async (interaction: any): Promise<void> => {
        const channelId = interaction.channelId;
        let alarmTime = interaction.options.getString("출항시간") ?? null;

        if (alarmTime) {
            // 출항 시간에 대한 유효성 검증
            const [valid, message] = validateDate(alarmTime);

            if (!valid) {
                return interaction.reply({
                    content: message,
                    ephemeral: true,
                });
            }

            alarmTime = alarmTime?.replace(/ /g, "");
            alarmTime = alarmTime?.replace(/:/g, "");
        }

        const newShip = new Ship(
            interaction.options.getString("선명"),
            channelId,
            interaction.options.getInteger("인원수"),
            interaction.options.getString("설명") ?? "설명이 없습니다.",
            alarmTime,
            interaction.options.getBoolean("중참가능여부") ?? null,
        );

        // 동일한 채널에 같은 이름의 어선이 존재하는지 확인
        const isExists = await this.shipRepository.exists({
            where: {
                name: newShip.name,
                channelId: channelId,
            },
        });
        if (isExists) {
            return interaction.reply({
                content: "이미 존재하는 어선입니다.",
                ephemeral: true,
            });
        }

        try {
            await begin();

            // 어선 저장
            const savedShip = await this.shipRepository.save(newShip.toEntity());

            // 선원(선장) 저장
            const newCaptain = new Crew(interaction.user.id, interaction.user.username, interaction.user.globalName, savedShip.id, "선장");
            await this.crewRepository.save(newCaptain.toEntity());

            // 알람 저장
            const newAlarm = new Alarm(savedShip.id, alarmTime, "Y");
            if (alarmTime) {
                await this.alarmRepository.save(newAlarm.toEntity());
            }

            await commit();
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }

            await rollback();

            return interaction.reply({
                content: "어선 생성에 실패했습니다.",
                ephemeral: true,
            });
        } finally {
            await release();
        }

        const shipEmbed = {
            color: 0x0099ff,
            title: newShip.name,
            description: newShip.description,
            fields: [
                {
                    name: "인원수",
                    value: `총 ${newShip.capacity}명`,
                },
                {
                    name: "출항시간",
                    value: alarmTime ? `${alarmTime.substring(0, 2)}:${alarmTime.substring(2, 4)}` : "설정되지 않음",
                },
                {
                    name: "중도참여 가능여부",
                    value: newShip.canMidParticipation ? "가능" : "불가능",
                },
            ],
            timestamp: new Date(),
            footer: {
                text: "어선 생성 완료!",
            },
        };

        return interaction.reply({ embeds: [shipEmbed] });
    };

    public sinking = async (interaction: any): Promise<void> => {
        const clientId = interaction.user.id;
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const ship = await this.shipRepository.findOne({
            where: {
                name: shipName,
                channelId: channelId,
            },
        });
        if (!ship) {
            return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", ephemeral: true });
        }

        const isCaptain = await this.crewRepository.findOne({
            where: {
                userId: clientId,
                position: "선장",
                ship: {
                    id: ship.id,
                },
            },
        });
        if (!isCaptain) {
            return interaction.reply({ content: "어선의 선장만 침몰시킬 수 있습니다.", ephemeral: true });
        }

        // 어선 삭제
        try {
            await begin();

            const allCrews = await this.crewRepository.find({
                where: {
                    ship: {
                        name: shipName,
                        channelId: channelId,
                    },
                },
            });
            if (allCrews) {
                await this.crewRepository.remove(allCrews);
            }

            // 알람 삭제
            const allAlams = await this.alarmRepository.findOne({
                where: {
                    ship: {
                        name: shipName,
                        channelId: channelId,
                    },
                },
            });
            if (allAlams) {
                await this.alarmRepository.remove(allAlams);
            }

            // 어선 삭제
            await this.shipRepository.remove(ship);

            await commit();
        } catch (err: unknown) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }

            await rollback();
            return interaction.reply({ content: "어선이 침몰하지 않았습니다.", ephemeral: true });
        } finally {
            await release();
        }

        const shipEmbed = {
            color: 0x0099ff,
            title: shipName,
            description: "어선이 침몰되었습니다!",
            timestamp: new Date(),
            footer: {
                text: "꼬르륵!",
            },
        };

        return interaction.reply({ embeds: [shipEmbed] });
    };

    public searchShips = async (interaction: any): Promise<void> => {
        const channelId = interaction.channelId;
        const ships = await this.shipRepository.find({
            where: {
                channelId: channelId,
            },
        });

        if (ships.length === 0) {
            return interaction.reply({ content: "어선이 존재하지 않습니다.", ephemeral: true });
        }

        const shipEmbeds = ships.map((ship) => ({
            color: 0x0099ff,
            title: ship.name,
            description: ship.description,
            fields: [
                {
                    name: "인원수",
                    value: `총 ${ship.capacity}명`,
                },
            ],
        }));

        return interaction.reply({ embeds: shipEmbeds, ephemeral: true });
    };

    public searchCrewsInShip = async (interaction: any): Promise<void> => {
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const ship = await this.shipRepository.findOne({
            where: {
                name: shipName,
                channelId: channelId,
            },
        });
        if (!ship) {
            return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", ephemeral: true });
        }

        // 어선에 탑승한 선원들 조회
        const crews = await this.crewRepository.find({
            where: {
                ship: {
                    name: shipName,
                    channelId: channelId,
                },
            },
        });

        if (crews.length === 0) {
            return interaction.reply({ content: "해당 어선에 탑승한 선원이 없습니다.", ephemeral: true });
        }

        const crewsName = crews.map((crew) => crew.userGlobalName);
        const userMentions = crewsName.map((crewName) => `${crewName}`).join("\n");

        const crewsEmbed = {
            color: 0x0099ff,
            title: shipName,
            description: "선원목록",
            fields: [
                {
                    name: "탑승인원",
                    value: userMentions,
                },
            ],
        };

        return interaction.reply({ embeds: [crewsEmbed], ephemeral: true });
    };

    public embark = async (interaction: any): Promise<void> => {
        const crewId = interaction.user.id;
        const crewName = interaction.user.username;
        const crewGlobalName = interaction.user.globalName;
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const ship = await this.shipRepository.findOne({
            where: {
                name: shipName,
                channelId: channelId,
            },
        });
        if (ship === null) {
            return interaction.reply({
                content: "해당 어선이 존재하지 않습니다.",
                ephemeral: true,
            });
        }

        // 어선 탑승여부 확인
        const isExists = await this.crewRepository.exists({
            where: {
                userId: crewId,
                shipId: ship.id,
            },
        });
        if (isExists) {
            return interaction.reply({
                content: "이미 해당 어선에 탑승하고 있습니다.",
                ephemeral: true,
            });
        }

        const crews = await this.crewRepository.find({
            where: {
                ship: {
                    name: shipName,
                    channelId: channelId,
                },
            },
        });
        if (crews.length >= ship.capacity) {
            return interaction.reply({
                content: "어선의 정원이 초과되었습니다.",
                ephemeral: true,
            });
        }

        if (ship.canMidParticipation === "N") {
            const alarmTime = await this.alarmRepository.findOne({
                where: {
                    shipId: ship.id,
                },
            });
            if (alarmTime !== null) {
                const now = new Date();
                const nowHHMM = now.getHours() * 100 + now.getMinutes();

                if (nowHHMM >= parseInt(alarmTime.alarmTime)) {
                    return interaction.reply({
                        content: "어선의 출항시간이 지나서 승선할 수 없습니다!",
                        ephemeral: true,
                    });
                }
            }
        }

        try {
            await begin();

            console.log("===== 어선 승선 시작 =====");
            console.log("유저 ID: ", crewId);
            console.log("유저 이름: ", crewName);
            console.log("유저 글로벌 이름: ", crewGlobalName);
            console.log("어선 ID: ", ship.id);
            console.log("유저 역할: ", "선원");

            this.crewRepository.save({
                userId: crewId,
                username: crewName,
                userGlobalName: crewGlobalName,
                shipId: ship.id,
                position: "선원",
            });

            console.log("===== 어선 승선 완료 =====");

            await commit();
        } catch (err) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }
            await rollback();

            return interaction.reply({
                content: "어선 승선에 실패했습니다.",
                ephemeral: true,
            });
        } finally {
            await release();
        }

        const shipEmbed = {
            color: 0x0099ff,
            title: shipName,
            description: "승선 완료!",
            timestamp: new Date(),
            footer: {
                text: "어선 승선 완료!",
            },
        };

        return interaction.reply({ embeds: [shipEmbed] });
    };

    public desembark = async (interaction: any): Promise<void> => {
        const crewId = interaction.user.id;
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        const crew = await this.crewRepository.findOne({
            where: {
                userId: crewId,
                ship: {
                    name: shipName,
                    channelId: channelId,
                },
            },
        });

        if (crew === null) {
            return interaction.reply({
                content: "해당 어선에 탑승하고 있지 않습니다.",
                ephemeral: true,
            });
        }

        let isCaptain = false;
        try {
            await begin();

            // 어선 하선
            await this.crewRepository.remove(crew);

            // 하선한 선원의 역할이 선장일 경우, 어선도 같이 침몰
            if (crew.position === "선장") {
                this.log.info("현재 유저의 역할이 선장입니다. 어선도 같이 침몰합니다.");

                isCaptain = true;

                // 모든 선원 삭제
                const allCrews = await this.crewRepository.find({
                    where: {
                        ship: {
                            name: shipName,
                            channelId: channelId,
                        },
                    },
                });
                if (allCrews) {
                    await this.crewRepository.remove(allCrews);
                }

                this.log.debug("모든 유저를 삭제했습니다.");

                // 알람 삭제
                const allAlams = await this.alarmRepository.find({
                    where: {
                        ship: {
                            name: shipName,
                            channelId: channelId,
                        },
                    },
                });
                if (allAlams) {
                    await this.alarmRepository.remove(allAlams);
                }

                this.log.debug("모든 알람을 삭제했습니다.");

                // 어선 삭제
                await this.shipRepository.delete({
                    name: shipName,
                    channelId: channelId,
                });

                this.log.debug("어선을 삭제했습니다.");
            }

            await commit();
        } catch (err) {
            if (err instanceof Error) {
                this.log.error("Error: " + err.message);
            }
            await rollback();

            return interaction.reply({
                content: "어선 하선에 실패했습니다.",
                ephemeral: true,
            });
        } finally {
            await release();
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

        return interaction.reply({ embeds: [shipEmbed], ephemeral: true });
    };

    public callingSailor = async (interaction: any): Promise<void> => {
        const channel = interaction.channel;
        const channelId = interaction.channelId;
        const shipName = interaction.options.getString("선명");

        // 어선에 탑승한 선원들 조회
        const crews = await this.crewRepository.find({
            where: {
                ship: {
                    name: shipName,
                    channelId: channelId,
                },
            },
        });

        if (crews.length === 0) {
            return interaction.reply({
                content: "해당 어선에 탑승한 선원이 없습니다.",
                ephemeral: true,
            });
        }

        const crewIds = crews.map((crew) => crew.userId);
        let userMentions = crewIds.map((userId) => `<@${userId}>`).join(", ");
        userMentions = userMentions + ` 선원들! 지금 당장 ${shipName} 어선에 탑승하시오!`;

        channel.send(userMentions);
        return interaction.reply({
            content: "어선에 탑승한 인원들에게 알림을 보냈습니다.",
            ephemeral: true,
        });
    };
}
