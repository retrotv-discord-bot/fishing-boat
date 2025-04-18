const CrewEntity = require("./crew.entity");

class Crew {
    constructor(userId, username, userGlobalName, shipId, position) {
        this.userId = userId;
        this.username = username;
        this.userGlobalName = userGlobalName;
        this.shipId = shipId;
        this.position = position;
    }

    toEntity() {
        return new CrewEntity(
            this.userId,
            this.username,
            this.userGlobalName,
            this.shipId,
            this.position,
        );
    }
}

module.exports = Crew;
