const { db } = require("./index");

module.exports = {
  install: () => db.serialize(() => {

    // ships 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS SHIP (
            ID INTEGER AUTOINCREMENT NOT NULL
          , NAME TEXT NOT NULL
          , CHANNEL_ID TEXT NOT NULL
          , CAPACITY INTEGER NOT NULL
          , DESCRIPTION TEXT
          , PRIMARY KEY (NAME, CHANNEL_ID)
      )
    `);

    // crew_members 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS CREW (
            USERNAME TEXT NOT NULL
          , SHIP_ID INTEGER NOT NULL
          , POSITION TEXT NOT NULL
          , FOREIGN KEY (SHIP_ID) REFERENCES SHIP (ID)
          , PRIMARY KEY (USERNAME, SHIP_ID)
      )
    `);
  })
};