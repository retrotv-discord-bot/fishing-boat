import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";

import ShipEntity from "./ship.entity";

@Entity("ALARM")
export default class AlarmEntity {
    constructor(shipId: string, alarmTime: string, use: string = "Y") {
        this.shipId = shipId;
        this.alarmTime = alarmTime;
        this.use = use;
    }

    @PrimaryColumn({ name: "SHIP_ID", type: "text" })
    shipId: string;

    @PrimaryColumn({ name: "ALARM_TIME", type: "text" })
    alarmTime: string;

    @Column({ name: "USE", type: "text", default: "Y" })
    use: string;

    @OneToOne(() => ShipEntity, (ship) => ship.id)
    @JoinColumn({ name: "SHIP_ID" })
    ship?: ShipEntity;
}
