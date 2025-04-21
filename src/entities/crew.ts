import CrewEntity from "./crew.entity";

export default class Crew {
    constructor(userId: string, username: string, userGlobalName: string, shipId: string, position: string) {
        this.userId = userId;
        this.username = username;
        this.userGlobalName = userGlobalName;
        this.shipId = shipId;
        this.position = position;

        console.log("유저 ID: ", this.userId);
        console.log("유저 이름: ", this.username);
        console.log("유저 글로벌 이름: ", this.userGlobalName);
        console.log("어선 ID: ", this.shipId);
        console.log("유저 역할: ", this.position);
    }

    userId: string;
    username: string;
    userGlobalName: string;
    shipId: string;
    position: string;

    toEntity(): CrewEntity {
        return new CrewEntity(this.userId, this.username, this.userGlobalName, this.shipId, this.position);
    }
}
