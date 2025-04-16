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

    getAllAlarms: () => {
      const result = db.prepare(`
        SELECT *
          FROM ALARM
         WHERE ALARM_TIME <= (SELECT STRFTIME('%H%M', 'now', 'localtime'))
      `).all();

      return result;
    }
  }
}