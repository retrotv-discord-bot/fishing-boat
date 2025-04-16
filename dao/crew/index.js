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

    insertCrew: (userId, username, userGlobalName, shipId, position) => {
      db.exec(`
        INSERT INTO CREW (
              USER_ID
            , USERNAME
            , USER_GLOBAL_NAME
            , SHIP_ID
            , POSITION
        ) VALUES (
              '${userId}'
            , '${username}'
            , '${userGlobalName}'
            , '${shipId}'
            , '${position}'
        )
      `);
    },

    selectCrew: (userId, shipName, channelId) => {
      const crew = db.prepare(`
        SELECT C.USER_ID
             , C.POSITION
          FROM CREW C
         INNER JOIN SHIP S
            ON C.SHIP_ID = S.ID
         WHERE C.USER_ID = '${userId}'
           AND S.NAME = '${shipName}'
           AND S.CHANNEL_ID = '${channelId}'
      `).all();

      return crew;
    },

    selectAllCrewInShip: (shipName, channelId) => {
      const crew = db.prepare(`
        SELECT C.USER_ID
          FROM CREW C
        INNER JOIN SHIP S
            ON C.SHIP_ID = S.ID
        WHERE S.NAME = '${shipName}'
          AND S.CHANNEL_ID = '${channelId}'
      `).all();

      return crew;
    },

    selectAllCrewsCountInShip: (shipName, channelId) => {
      const count = db.prepare(`
        SELECT COUNT(*) AS COUNT
          FROM CREW C
        INNER JOIN SHIP S
            ON C.SHIP_ID = S.ID
        WHERE S.NAME = '${shipName}'
          AND S.CHANNEL_ID = '${channelId}'
      `).all()[0].COUNT;

      return count;
    },

    deleteCrew: (userId, shipName, channelId) => {
      db.exec(`
        DELETE FROM CREW
         WHERE USER_ID = '${userId}'
           AND SHIP_ID = (
               SELECT ID
                 FROM SHIP
                WHERE NAME = '${shipName}'
                  AND CHANNEL_ID = '${channelId}'
           )
      `);
    }
  }
}