const { db } = require("../../databases");

module.exports = {
  alarmDao: {
    insertAlarm: (shipId, alarmTime) => {
      db.exec(`
        INSERT INTO ALARM (
               SHIP_ID
             , ALARM_TIME
        ) VALUES (
               '${shipId}'
             , '${alarmTime}'
        )
      `);
    },

    deleteAlarm: (shipId, alarmTime) => {
      db.exec(`
        DELETE FROM ALARM
         WHERE SHIP_ID = '${shipId}'
           AND ALARM_TIME = '${alarmTime}'
      `);
    },

    triggerdAlarm: (shipId, alarmTime) => {
      db.exec(`
        UPDATE ALARM
           SET USE = 'N'
         WHERE SHIP_ID = '${shipId}'
           AND ALARM_TIME = '${alarmTime}'
      `);
    },

    getAllAlarms: () => {
      const result = db.prepare(`
        SELECT *
          FROM ALARM
         WHERE ALARM_TIME <= (SELECT STRFTIME('%H%M', 'now', 'localtime'))
           AND USE = 'Y'
      `).all();

      return result;
    },

    getAlarmsByShipId: (shipId) => {
      const result = db.prepare(`
        SELECT *
          FROM ALARM
         WHERE SHIP_ID = '${shipId}'
      `).all();

      return result;
    },
  }
}