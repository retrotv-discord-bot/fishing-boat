import Vessel from "./vessel";

export default class VesselEntity implements Vessel {
    id: string;
    name: string;
    channelId: string;
    capacity: number;
    description: string;
    canMidParticipation: string;
    createdAt?: Date;

    constructor(
        id: string,
        name: string,
        channelId: string,
        capacity: number,
        description: string,
        canMidParticipation: string,
        createdAt?: Date,
    ) {
        this.id = id;
        this.name = name;
        this.channelId = channelId;
        this.capacity = capacity;
        this.description = description;
        this.canMidParticipation = canMidParticipation;
        this.createdAt = createdAt ?? new Date();
    }
}
