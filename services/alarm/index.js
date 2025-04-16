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
      const shipId = alarm['SHIP_ID'];
      const ship = shipDao.selectShipById(shipId);
      const shipName = ship['NAME'];
      const alarmTime = alarm['ALARM_TIME'];
      if (ship.length === 0) {
        console.error(`Ship with ID ${shipId} not found.`);
        return;
      }

      const channelId = ship['CHANNEL_ID'];
      const channel = await client.channels.fetch(channelId);

      channel.send(`⛴️ 출항 알림: 어선 ${shipName}이(가) 출항합니다! 출항 시간: ${alarmTime}`);
    });
  }
}