const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Alarm",
    tableName: "ALARM",
    columns: {
        shipId: {
            name: "SHIP_ID",
            type: "text",
            primary: true,
        },
        alarmTime: {
            name: "ALARM_TIME",
            type: "text",
            primary: true,
        },
        use: {
            name: "USE",
            type: "text",
            default: "Y",
        },
    },
    relations: {
        ship: {
            type: "one-to-one",
            target: "Ship",
            joinColumn: { name: "SHIP_ID" },
            inverseSide: "ID",
        },
    },
});
