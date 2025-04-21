import { Entity, PrimaryColumn, Column, BeforeInsert, ManyToMany } from "typeorm";
import crypto from "crypto";
import CrewEntity from "./crew.entity";

@Entity("SHIP")
export default class ShipEntity {
    constructor(id: string, name: string, channelId: string, capacity: number, description: string, canMidParticipation: string) {
        this.id = id;
        this.name = name;
        this.channelId = channelId;
        this.capacity = capacity;
        this.description = description;
        this.canMidParticipation = canMidParticipation;
    }

    @PrimaryColumn({ name: "ID", type: "text", unique: true })
    id: string;

    @Column({ name: "NAME", type: "text" })
    name: string;

    @Column({ name: "CHANNEL_ID", type: "text" })
    channelId: string;

    @Column({ name: "CAPACITY", type: "integer" })
    capacity: number;

    @Column({ name: "DESCRIPTION", type: "text" })
    description: string;

    @Column({ name: "CREATED_AT", type: "datetime", default: () => "STRFTIME('%Y%m%d%H', 'now', 'localtime')" })
    createdAt?: string;

    @Column({ name: "CAN_MID_PARTICIPATION", type: "text" })
    canMidParticipation: string;

    @ManyToMany(() => CrewEntity, (crew) => crew.ships)
    crews?: CrewEntity[];

    @BeforeInsert()
    async generateId() {
        this.id = crypto.createHash("sha3-512").update(this.id).digest("hex");
    }
}
