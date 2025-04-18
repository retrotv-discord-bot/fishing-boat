const { db } = require("../../config/databases");

module.exports = {
    shipDao: {
        isExist: (shipId, channelId) => {
            const count = db
                .prepare(
                    `
        SELECT COUNT(*) AS COUNT
          FROM SHIP
        WHERE ID = '${shipId}'
          AND CHANNEL_ID = '${channelId}'
      `,
                )
                .all()[0].COUNT;

            return count > 0;
        },

        insertShip: (shipId, name, channelId, capacity, description, canMidParticipation) => {
            db.exec(`
        INSERT INTO SHIP (
              ID
            , NAME
            , CHANNEL_ID
            , CAPACITY
            , DESCRIPTION
            , CAN_MID_PARTICIPATION
        ) VALUES (
              '${shipId}'
            , '${name}'
            , '${channelId}'
            , '${capacity}'
            , '${description}'
            , '${canMidParticipation}'
        )
      `);
        },

        selectShipById: (shipId) => {
            const ship = db
                .prepare(
                    `
        SELECT *
          FROM SHIP
        WHERE ID = '${shipId}'
      `,
                )
                .all();

            if (ship.length === 1) {
                return ship[0];
            }

            return [];
        },

        selectShip: (shipName, channelId) => {
            const ship = db
                .prepare(
                    `
        SELECT *
          FROM SHIP
        WHERE NAME = '${shipName}'
          AND CHANNEL_ID = '${channelId}'
      `,
                )
                .all();

            return ship;
        },

        selectAllShips: (channelId) => {
            const ships = db
                .prepare(
                    `
        SELECT *
          FROM SHIP
        WHERE CHANNEL_ID = '${channelId}'
      `,
                )
                .all();

            return ships;
        },

        selectAllShipsByName: (shipName, channelId) => {
            const ships = db
                .prepare(
                    `
        SELECT *
          FROM SHIP
        WHERE NAME LIKE '%${shipName}%'
          AND CHANNEL_ID = '${channelId}'
      `,
                )
                .all();

            return ships;
        },

        selectAllShipsByNameAndUserIdAndPosition: (shipName, channelId, userId, position) => {
            const ships = db
                .prepare(
                    `
        SELECT *
          FROM SHIP
         WHERE NAME LIKE '%${shipName}%'
           AND CHANNEL_ID = '${channelId}'
           AND ID IN (
               SELECT SHIP_ID
                 FROM CREW
                WHERE USER_ID = '${userId}'
                  AND POSITION = '${position}'
           )
      `,
                )
                .all();

            return ships;
        },

        selectAllShipsByNameAndUserId: (shipName, channelId, userId) => {
            const ships = db
                .prepare(
                    `
        SELECT *
          FROM SHIP
         WHERE NAME LIKE '%${shipName}%'
           AND CHANNEL_ID = '${channelId}'
           AND ID IN (
               SELECT SHIP_ID
                 FROM CREW
                WHERE USER_ID = '${userId}'
           )
      `,
                )
                .all();

            return ships;
        },

        deleteShip: (shipName, channelId) => {
            db.exec(`
        DELETE FROM SHIP
         WHERE NAME = '${shipName}'
           AND CHANNEL_ID = '${channelId}'
      `);
        },
    },
};
