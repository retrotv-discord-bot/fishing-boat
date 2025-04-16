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

    selectShipById: (shipId) => {
      const ship = db.prepare(`
        SELECT *
          FROM SHIP
        WHERE ID = '${shipId}'
      `).all();

      if (ship.length === 1) {
        return ship[0];
      }

      return [];
    },

    selectShip: (shipName, channelId) => {
      const ship = db.prepare(`
        SELECT *
          FROM SHIP
        WHERE NAME = '${shipName}'
          AND CHANNEL_ID = '${channelId}'
      `).all();

      return ship;
    },

    deleteShip: (shipName, channelId) => {
      db.exec(`
        DELETE FROM SHIP
         WHERE NAME = '${shipName}'
           AND CHANNEL_ID = '${channelId}'
      `);
    },
  }
}
