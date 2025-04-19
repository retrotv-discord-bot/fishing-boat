const { LessThanOrEqual } = require("typeorm");

const { alarmRepository } = require("@/repository/alarm.repository");
const { crewRepository } = require("@/repository/crew.repository");
const { shipRepository } = require("@/repository/ship.repository");

module.exports = {
    sendAlarm: async (client) => {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, "0");
        const currentMinute = String(now.getMinutes()).padStart(2, "0");
        const currentTime = currentHour + currentMinute;

        const alarms = await alarmRepository.find({
            where: {
                alarmTime: LessThanOrEqual(currentTime),
            },
        });

        alarms.forEach(async (alarm) => {
            console.log("shipId: ", alarm.shipId);
            console.log("alarmTime: ", alarm.alarmTime);

            const shipId = alarms.shipId;
            const ship = await shipRepository.findOne({
                where: {
                    shipId: shipId,
                },
            });
            const shipName = ship.name;
            console.log("shipName: ", shipName);

            if (!ship) {
                return;
            }

            const channelId = ship.channelId;
            console.log("channelId: ", channelId);

            const crews = await crewRepository.find({
                where: {
                    ship: {
                        name: shipName,
                        channelId: channelId,
                    },
                },
            });
            if (crews.length === 0) {
                return;
            }

            const crewIds = crews.map((crew) => crew.userId);

            let userMentions = `⛴️ 출항 알림: `;
            userMentions = userMentions + crewIds.map((userId) => `<@${userId}>`).join(", ");
            userMentions = userMentions + ` 선원들! 지금 당장 ${shipName}에 탑승하시오!`;

            try {
                const channel = await client.channels.fetch(channelId);
                channel.send(userMentions);
            } catch {
                console.error(`${channelId} 채널이 존재하지 않습니다.`);
            }

            // 알람 작동 끄기
            await alarmRepository.remove(alarm);
        });
    },
};
