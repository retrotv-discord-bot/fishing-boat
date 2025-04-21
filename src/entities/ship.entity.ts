import { Entity, PrimaryColumn, Column, BeforeInsert } from "typeorm";
import crypto from "crypto";

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

    @PrimaryColumn({ type: "text", unique: true })
    id: string;

    @Column({ type: "text" })
    name: string;

    @Column({ type: "text" })
    channelId: string;

    @Column({ type: "integer" })
    capacity: number;

    @Column({ type: "text" })
    description: string;

    @Column({ type: "datetime", default: () => "STRFTIME('%Y%m%d%H', 'now', 'localtime')" })
    createdAt?: string;

    @Column({ type: "text" })
    canMidParticipation: string;

    @BeforeInsert()
    async generateId() {
        this.id = crypto.createHash("sha3-512").update(this.id).digest("hex");
    }
}
