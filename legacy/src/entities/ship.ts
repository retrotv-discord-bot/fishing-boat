import ShipEntity from "./ship.entity";
import { digestSha3512 } from "../utils/cryptography";

export default class Ship {
    constructor(name: string, channelId: string, capacity: number, description: string, alarmTime: string, canMidParticipation?: boolean) {
        this.id = digestSha3512(name + channelId);
        this.name = name;
        this.channelId = channelId;
        this.capacity = capacity;
        this.description = description || "설명이 없습니다.";

        let cmp: boolean | undefined = true;
        if (alarmTime !== null && canMidParticipation !== null) {
            cmp = canMidParticipation;
        }

        this.canMidParticipation = cmp ? "Y" : "N";

        console.log("어선 ID: ", this.id);
        console.log("선명: ", this.name);
        console.log("채널 ID: ", this.channelId);
        console.log("인원수: ", this.capacity);
        console.log("설명: ", this.description);
        console.log("중참가능여부: ", this.canMidParticipation);
    }

    id: string;
    name: string;
    channelId: string;
    capacity: number;
    description: string;
    canMidParticipation: string;

    toEntity(): ShipEntity {
        return new ShipEntity(this.id, this.name, this.channelId, this.capacity, this.description, this.canMidParticipation);
    }
}
