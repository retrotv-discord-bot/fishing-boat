const { db } = require("./index");

module.exports = {
  install: () => db.serialize(() => {

    // ships 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS SHIP (
            NAME TEXT PRIMARY KEY
          , CAPACITY INTEGER NOT NULL
          , DESCRIPTION TEXT
      )
    `);

    // crew_members 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS CREW (
            USERNAME TEXT NOT NULL
          , SHIP_NAME TEXT NOT NULL
          , POSITION TEXT NOT NULL
          , FOREIGN KEY (SHIP_NAME) REFERENCES SHIP (NAME)
          , PRIMARY KEY (USERNAME, SHIP_NAME)
      )
    `);
  })
};