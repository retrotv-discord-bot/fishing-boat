const { db } = require("./index");

module.exports = {
  install: () => {

    // SHIP 테이블 생성
    db.exec(`
      CREATE TABLE IF NOT EXISTS SHIP (
            ID TEXT UNIQUE NOT NULL PRIMARY KEY
          , NAME TEXT NOT NULL
          , CHANNEL_ID TEXT NOT NULL
          , CAPACITY INTEGER NOT NULL
          , DESCRIPTION TEXT
          , CREATED_AT DATETIME DEFAULT (STRFTIME('%Y%m%d%H', 'now', 'localtime'))
          , CAN_MID_PARTICIPATION TEXT NOT NULL DEFAULT 'N'
      )
    `);

    // CREW 테이블 생성
    db.exec(`
      CREATE TABLE IF NOT EXISTS CREW (
            USER_ID TEXT NOT NULL
          , USERNAME TEXT NOT NULL
          , USER_GLOBAL_NAME TEXT NOT NULL
          , SHIP_ID TEXT NOT NULL
          , POSITION TEXT NOT NULL
          , FOREIGN KEY (SHIP_ID) REFERENCES SHIP (ID)
          , PRIMARY KEY (USER_ID, SHIP_ID)
      )
    `);

    // ALARM 테이블 생성
    db.exec(`
      CREATE TABLE IF NOT EXISTS ALARM (
            SHIP_ID TEXT NOT NULL
          , ALARM_TIME TEXT NOT NULL
          , FOREIGN KEY (SHIP_ID) REFERENCES SHIP (ID)
          , PRIMARY KEY (SHIP_ID, ALARM_TIME)
      )
    `);
  }
};