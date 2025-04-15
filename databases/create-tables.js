const { db } = require("./index");

module.exports = {
  install: () => db.serialize(() => {

    // SHIP 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS SHIP (
            ID TEXT UNIQUE NOT NULL PRIMARY KEY
          , NAME TEXT NOT NULL
          , CHANNEL_ID TEXT NOT NULL
          , CAPACITY INTEGER NOT NULL
          , DESCRIPTION TEXT
      )
    `);

    // CREW 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS CREW (
            USER_ID TEXT NOT NULL
          , SHIP_ID TEXT NOT NULL
          , POSITION TEXT NOT NULL
          , FOREIGN KEY (SHIP_ID) REFERENCES SHIP (ID)
          , PRIMARY KEY (USER_ID, SHIP_ID)
      )
    `);

    // ALARM 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS ALARM (
            SHIP_ID TEXT NOT NULL
          , ALARM_TIME TEXT NOT NULL
          , FOREIGN KEY (SHIP_ID) REFERENCES SHIP (ID)
          , PRIMARY KEY (SHIP_ID, ALARM_TIME)
      )
    `);
  })
};