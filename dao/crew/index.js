const { db } = require("../../databases");

module.exports = {
  crewDao: {
    isExist: (userId, shipId) => {
      const count = db.prepare(`
        SELECT COUNT(*) AS COUNT
          FROM CREW
        WHERE USER_ID = '${userId}'
          AND SHIP_ID = '${shipId}'
      `).all()[0].COUNT;

      return count > 0;
    },

    insertCrew: (userId, shipId, position) => {
      db.exec(`
        INSERT INTO CREW (
              USER_ID
            , SHIP_ID
            , POSITION
        ) VALUES (
              '${userId}'
            , '${shipId}'
            , '${position}'
        )
      `);
    },

    selectAllCrewInShip: (shipId, channelId) => {
      const crew = db.prepare(`
        SELECT C.USER_ID
          FROM CREW C
        INNER JOIN SHIP S
            ON C.SHIP_ID = S.ID
        WHERE S.NAME = '${shipId}'
          AND S.CHANNEL_ID = '${channelId}'
      `).all();

      return crew;
    },
  }
}