import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";

import ShipEntity from "./ship.entity";

@Entity("CREW")
export default class CrewEntity {
    constructor(userId: string, username: string, userGlobalName: string, shipId: string, position: string) {
        this.userId = userId;
        this.username = username;
        this.userGlobalName = userGlobalName;
        this.shipId = shipId;
        this.position = position;
    }

    @PrimaryColumn({ type: "text" })
    userId: string;

    @Column({ type: "text" })
    username: string;

    @Column({ type: "text" })
    userGlobalName: string;

    @PrimaryColumn({ type: "text" })
    shipId: string;

    @Column({ type: "text" })
    position: string;

    @ManyToOne(() => ShipEntity, (ship) => ship.id)
    @JoinColumn({ name: "shipId" })
    ship?: ShipEntity;
}
