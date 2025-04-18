const { EntitySchema } = require("typeorm");
const ShipEntity = require("./ship.entity");

module.exports = new EntitySchema({
    name: "Crew",
    tableName: "CREW",
    columns: {
        userId: {
            name: "USER_ID",
            type: "text",
            primary: true,
        },
        username: {
            name: "USERNAME",
            type: "text",
        },
        userGlobalName: {
            name: "USER_GLOBAL_NAME",
            type: "text",
        },
        shipId: {
            name: "SHIP_ID",
            type: "text",
            primary: true,
        },
        position: {
            name: "POSITION",
            type: "text",
        },
    },
    relations: {
        ship: {
            target: ShipEntity,
            type: "many-to-one",
            joinColumn: { name: "SHIP_ID" },
        },
    },
});
