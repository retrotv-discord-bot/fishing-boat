const crypto = require("crypto");

const { shipRepository } = require("../../repository/ship.repository");
const { crewRepository } = require("../../repository/crew.repository");
const { alarmRepository } = require("../../repository/alarm.repository");
const { begin, commit, rollback, release } = require("../../config/datasource");

module.exports = {
    createNewShip: async (interaction) => {
        const name = interaction.options.getString("선명");
        const channelId = interaction.channelId;
        const capacity = interaction.options.getInteger("인원수");
        const description = interaction.options.getString("설명") || "설명이 없습니다.";
        let alarmTime = interaction.options.getString("출항시간") || null;
        let canMidParticipation = true;

        if (alarmTime !== null && interaction.options.getBoolean("중참가능여부") !== null) {
            canMidParticipation = interaction.options.getBoolean("중참가능여부");
        }

        // 출항 시간에 대한 유효성 검증
        const [ valid, message ] = __validateAlarmTime(alarmTime);

        if (!valid) {
            return interaction.reply({
                content: message,
                ephemeral: true,
            });
        }

        const clientId = interaction.user.id;
        const clientName = interaction.user.username;
        const clientGlobalName = interaction.user.globalName;
        const shipId = crypto.createHash("sha512").update(name + channelId).digest("hex");

        const isExists = await shipRepository.exists({
            where: {
                id: shipId,
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

            console.log("===== 어선 생성 시작 =====");
            console.log("선명: ", name);
            console.log("채널 ID: ", channelId);
            console.log("인원수: ", capacity);
            console.log("설명: ", description);
            console.log("출항시간: ", alarmTime);
            console.log("중참가능여부: ", canMidParticipation);

            await shipRepository.save({
                id: shipId,
                name: name,
                channelId: channelId,
                capacity: capacity,
                description: description,
                canMidParticipation: canMidParticipation ? "Y" : "N",
            });

            console.log("===== 어선 생성 완료 =====")

            console.log("===== 선원 생성 시작 =====");
            console.log("유저 ID: ", clientId);
            console.log("유저 이름: ", clientName);
            console.log("유저 글로벌 이름: ", clientGlobalName);
            console.log("어선 ID: ", shipId);
            console.log("유저 역할: ", "선장");

            await crewRepository.save({
                userId: clientId,
                username: clientName,
                userGlobalName: clientGlobalName,
                shipId: shipId,
                position: "선장",
            });

            console.log("===== 선원 생성 완료 =====")

            console.log("===== 알람 생성 시작 =====");
            console.log("어선 ID: ", shipId);
            console.log("출항시간: ", alarmTime);

            if (alarmTime) {
                alarmRepository.save({
                    shipId: shipId,
                    alarmTime: alarmTime,
                });
            }

            console.log("===== 알람 생성 완료 =====")

            await commit();
        } catch (err) {
            console.error(err.message);
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
            title: name,
            description: description,
            fields: [
                {
                    name: "인원수",
                    value: `총 ${capacity}명`,
                },
                {
                    name: "출항시간",
                    value: alarmTime ? `${alarmTime.substring(0, 2)}:${alarmTime.substring(2, 4)}` : "설정되지 않음",
                },
                {
                    name: "중도참여 가능여부",
                    value: canMidParticipation ? "가능" : "불가능",
                },
            ],
            timestamp: new Date(),
            footer: {
                text: "어선 생성 완료!",
            },
        };

        return interaction.reply({ embeds: [shipEmbed] });
    },

    embark: async (interaction) => {
        const crewId = interaction.user.id;
        const crewName = interaction.user.username;
        const crewGlobalName = interaction.user.globalName;
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const ship = await shipRepository.findOne({
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
        const isExists = await crewRepository.exists({
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

        const crews = await crewRepository.find({
            where: {
                channelId: channelId,
                ship: {
                    shipName: shipName,
                }
            },
        });
        if (crews.length >= ship.capacity) {
            return interaction.reply({
                content: "어선의 정원이 초과되었습니다.",
                ephemeral: true,
            });
        }

        if (ship.canMidParticipation === "N") {
            const alarmTime = alarmRepository.findOne({
                where: {
                    shipId: ship.id,
                },
            });
            if (alarmTime !== null) {
                const now = new Date();
                const nowHHMM = now.getHours() * 100 + now.getMinutes();

                if (nowHHMM > alarmTime.alarmTime) {
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

            crewRepository.save({
                userId: crewId,
                username: crewName,
                userGlobalName: crewGlobalName,
                shipId: ship.id,
                position: "선원",
            });

            console.log("===== 어선 승선 완료 =====")

            await commit();
        } catch (err) {
            console.error(err.message);
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
    },

    disembark: async (interaction) => {
        const crewId = interaction.user.id;
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        const crew = await crewRepository.findOne({
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

            console.log("===== 어선 하선 시작 =====");
            console.log("유저 ID: ", crewId);
            console.log("어선 명: ", shipName);
            console.log("어선 채널 ID: ", channelId);

            await crewRepository.remove(
                await crewRepository.findOne({
                    where: {
                        userId: crewId,
                        ship: {
                            name: shipName,
                            channelId: channelId,
                        },
                    },
                }),
            );

            console.log("===== 어선 하선 완료 =====")

            // 하선한 선원의 역할이 선장일 경우, 어선도 같이 침몰
            if (crew.position === "선장") {
                console.log("현재 유저의 역할이 선장입니다. 어선도 같이 침몰합니다.");

                isCaptain = true;

                // 모든 선원 삭제
                const allCrews = await crewRepository.find({
                    where: {
                        ship: {
                            name: shipName,
                            channelId: channelId,
                        },
                    },
                });

                if (allCrews) {
                    await crewRepository.remove(allCrews);
                }

                console.log("모든 유저를 삭제했습니다.");

                // 알람 삭제
                const allAlams = await alarmRepository.findOne({
                    where: {
                        ship: {
                            name: shipName,
                            channelId: channelId,
                        },
                    },
                });
                if (allAlams) {
                    await alarmRepository.remove(allAlams);
                }

                console.log("모든 알람을 삭제했습니다.");

                console.log("===== 어선 침몰 시작 =====");
                console.log("어선 ID: ", shipName);
                console.log("어선 채널 ID: ", channelId);

                // 어선 삭제
                await shipRepository.delete({
                    name: shipName,
                    channelId: channelId,
                });

                console.log("===== 어선 침몰 완료 =====");
            }

            await commit();
        } catch (err) {
            console.error(err.message);
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
    },

    callingSailor: async (interaction) => {
        const channel = interaction.channel;
        const channelId = interaction.channelId;
        const shipName = interaction.options.getString("선명");

        // 어선에 탑승한 선원들 조회
        const crews = await crewRepository.find({
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
        userMentions = userMentions + " 선원들! 지금 당장 어선에 탑승하시오!";

        channel.send(userMentions);
        return interaction.reply({
            content: "어선에 탑승한 인원들에게 알림을 보냈습니다.",
            ephemeral: true,
        });
    },

    sinkingShip: async (interaction) => {
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const ship = await shipRepository.findOne({
            where: {
                name: shipName,
                channelId: channelId,
            },
        });
        if (!ship) {
            return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", ephemeral: true });
        }

        const isCaptain = await crewRepository.findOne({
            where: {
                userId: interaction.user.id,
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

            await crewRepository.remove(
                await crewRepository.find({
                    where: {
                        ship: {
                            name: shipName,
                            channelId: channelId,
                        },
                    },
                }),
            );
            await shipRepository.remove(ship);

            await commit();
        } catch (err) {
            console.error(err.message);
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
    },

    searchAllShips: async (interaction) => {
        const channelId = interaction.channelId;
        const ships = await shipRepository.find({
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
    },

    searchCrewsInShip: async (interaction) => {
        const shipName = interaction.options.getString("선명");
        const channelId = interaction.channelId;

        // 어선 조회
        const ship = await shipRepository.findOne({
            where: {
                name: shipName,
                channelId: channelId,
            },
        });
        if (!ship) {
            return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", ephemeral: true });
        }

        // 어선에 탑승한 선원들 조회
        const crews = await crewRepository.find({
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
        let userMentions = crewsName.map((crewName) => `${crewName}`).join("\n");

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
            timestamp: new Date(),
        };

        return interaction.reply({ embeds: [crewsEmbed], ephemeral: true });
    },
};

function __validateAlarmTime(alarmTime) {
    if (alarmTime) {
        alarmTime = alarmTime.trim();
        alarmTime = alarmTime.replace(":", "");
        alarmTime = alarmTime.replace(" ", "");

        if (alarmTime.length !== 4 && alarmTime.length !== 3) {
            return [ false, "출항시간은 24시간 체계의 hhmm 혹은 hh:mm 형식으로 입력해주세요.\n예시: 18:30, 06:00, 9:00, 1000, 2030, 800" ];
        }

        if (alarmTime.length === 3) {
            alarmTime = "0" + alarmTime;
        }

        const hh = alarmTime.substring(0, 2);
        const mm = alarmTime.substring(2, 4);
        if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
            return [ false, "출항시간이 정상적인 시간의 범주가 아닙니다." ];
        }

        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentAlarmTime = parseInt(currentHours.toString().padStart(2, "0") + currentMinutes.toString().padStart(2, "0"), 10);
        const inputAlarmTime = parseInt(alarmTime, 10);

        if (inputAlarmTime <= currentAlarmTime) {
            return [ false, "출항시간은 현재 시간보다 미래로 설정해야 합니다." ];
        }
    }
    return [ true, null ];
}
