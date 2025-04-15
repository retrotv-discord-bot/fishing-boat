const { db } = require("../../databases");

module.exports = {
  shipDao: {
    isExist: (shipId, channelId) => {
      const count = db.prepare(`
        SELECT COUNT(*) AS COUNT
          FROM SHIP
        WHERE ID = '${shipId}'
          AND CHANNEL_ID = '${channelId}'
      `).all()[0].COUNT;
      
      return count > 0;
    },

    insertShip: (shipId, name, channelId, capacity, description) => {
      db.exec(`
        INSERT INTO SHIP (
              ID
            , NAME
            , CHANNEL_ID
            , CAPACITY
            , DESCRIPTION
        ) VALUES (
              '${shipId}'
            , '${name}'
            , '${channelId}'
            , '${capacity}'
            , '${description}'
        )
      `);
    },
  }
}
