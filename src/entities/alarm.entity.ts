import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";

import ShipEntity from "./ship.entity";

@Entity("ALARM")
export default class AlarmEntity {
    constructor(shipId: string, alarmTime: string, use: string = "Y") {
        this.shipId = shipId;
        this.alarmTime = alarmTime;
        this.use = use;
    }

    @PrimaryColumn({ type: "text" })
    shipId: string;

    @PrimaryColumn({ type: "text" })
    alarmTime: string;

    @Column({ type: "text", default: "Y" })
    use: string;

    @OneToOne(() => ShipEntity, (ship) => ship.id)
    @JoinColumn({ name: "shipId" })
    ship?: ShipEntity;
}
