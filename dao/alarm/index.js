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

    deleteAlarm: (shipId) => {
      db.exec(`
        DELETE FROM ALARM
         WHERE SHIP_ID = '${shipId}'
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