const { db } = require("../../config/databases");

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
            let sql = `DELETE FROM ALARM
                        WHERE SHIP_ID = '${shipId}'`;
            if (alarmTime) {
                sql += `AND ALARM_TIME = '${alarmTime}'`;
            }
            db.exec(sql);
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
            const result = db
                .prepare(
                    `
        SELECT *
          FROM ALARM
         WHERE ALARM_TIME <= (SELECT STRFTIME('%H%M', 'now', 'localtime'))
           AND USE = 'Y'
      `,
                )
                .all();

            return result;
        },

        getAlarmsByShipId: (shipId) => {
            const result = db
                .prepare(
                    `
        SELECT *
          FROM ALARM
         WHERE SHIP_ID = '${shipId}'
      `,
                )
                .all();

            return result;
        },
    },
};
