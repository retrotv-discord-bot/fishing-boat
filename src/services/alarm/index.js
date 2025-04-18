const { shipDao } = require("../../dao/ship");
const { crewDao } = require("../../dao/crew");
const { alarmDao } = require("../../dao/alarm");

module.exports = {
    sendAlarm: (client) => {
        const alarms = alarmDao.getAllAlarms();
        if (alarms.length === 0) {
            console.log("No alarms to send.");
            return;
        }

        alarms.forEach(async (alarm) => {
            const shipId = alarm["SHIP_ID"];
            const ship = shipDao.selectShipById(shipId);
            const shipName = ship["NAME"];
            const alarmTime = alarm["ALARM_TIME"];

            if (ship.length === 0) {
                return;
            }

            const channelId = ship["CHANNEL_ID"];

            const crews = crewDao.selectAllCrewInShip(shipName, channelId);
            if (crews.length === 0) {
                return;
            }

            const arrCrewId = crews.map((crew) => crew["USER_ID"]);

            let userMentions = `⛴️ 출항 알림: `;
            userMentions = userMentions + arrCrewId.map((userId) => `<@${userId}>`).join(", ");
            userMentions = userMentions + ` 선원들! 지금 당장 ${shipName}에 탑승하시오!`;

            try {
                const channel = await client.channels.fetch(channelId);
                channel.send(userMentions);
            } catch {
                console.error(`${channelId} 채널이 존재하지 않습니다.`);
            }

            // 알람 작동 끄기
            alarmDao.triggerdAlarm(shipId, alarmTime);
        });
    },
};
