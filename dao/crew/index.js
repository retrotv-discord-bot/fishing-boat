const { db } = require("../../databases");

module.exports = {
  crewDao: {
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
    }
  }
}