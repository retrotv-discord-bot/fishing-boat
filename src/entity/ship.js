const ShipEntity = require("./ship.entity");

class Ship {
    constructor(name, channelId, capacity, description, canMidParticipation) {
        this.id = name + channelId;
        this.name = name;
        this.channelId = channelId;
        this.capacity = capacity;
        this.description = description || "설명이 없습니다.";
        this.canMidParticipation = canMidParticipation ? "Y" : "N";
    }

    toEntity() {
        return new ShipEntity(
            this.id,
            this.name,
            this.channelId,
            this.capacity,
            this.description,
            this.canMidParticipation,
        );
    }
}

module.exports = Ship;
