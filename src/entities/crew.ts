import CrewEntity from "./crew.entity";
import type ShipEntity from "./ship.entity";

export default class Crew {
    constructor(userId: string, username: string, userGlobalName: string, position: string, ships: ShipEntity[]) {
        this.userId = userId;
        this.username = username;
        this.userGlobalName = userGlobalName;
        this.position = position;
        this.ships = ships;
    }

    userId: string;
    username: string;
    userGlobalName: string;
    position: string;
    ships: ShipEntity[];

    toEntity(): CrewEntity {
        return new CrewEntity(this.userId, this.username, this.userGlobalName, this.position, this.ships);
    }
}
