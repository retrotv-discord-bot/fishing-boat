const { EntitySchema } = require("typeorm");
const crypto = require("crypto");

module.exports = new EntitySchema({
    name: "Ship",
    tableName: "SHIP",
    columns: {
        id: {
            name: "ID",
            type: "text",
            primary: true,
            unique: true,
        },
        name: {
            name: "NAME",
            type: "text",
        },
        channelId: {
            name: "CHANNEL_ID",
            type: "text",
        },
        capacity: {
            name: "CAPACITY",
            type: "integer",
        },
        description: {
            name: "DESCRIPTION",
            type: "text",
        },
        createdAt: {
            name: "CREATED_AT",
            type: "datetime",
            default: () => "STRFTIME('%Y%m%d%H', 'now', 'localtime')",
        },
        canMidParticipation: {
            name: "CAN_MID_PARTICIPATION",
            type: "text",
        },
    },
    beforeInsert: async (entity) => {
        entity.id = crypto.createHash("sha3-512").update(entity.id).digest("hex");
    },
});
