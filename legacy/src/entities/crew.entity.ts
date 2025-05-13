import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable } from "typeorm";

import ShipEntity from "./ship.entity";

@Entity("CREW")
export default class CrewEntity {
    constructor(userId: string, username: string, userGlobalName: string, position: string, ships: ShipEntity[]) {
        this.userId = userId;
        this.username = username;
        this.userGlobalName = userGlobalName;
        this.position = position;
        this.ships = ships;
    }

    @PrimaryColumn({ name: "USER_ID", type: "text" })
    userId: string;

    @Column({ name: "USERNAME", type: "text" })
    username: string;

    @Column({ name: "USER_GLOBAL_NAME", type: "text" })
    userGlobalName: string;

    @Column({ name: "POSITION", type: "text" })
    position: string;

    @ManyToMany(() => ShipEntity, (ship) => ship.crews)
    @JoinTable({
        name: "CREW_SHIP", // 중간 테이블 이름
        joinColumn: {
            name: "USER_ID",
            referencedColumnName: "userId",
        },
        inverseJoinColumn: {
            name: "SHIP_ID",
            referencedColumnName: "id",
        },
    })
    ships?: ShipEntity[];
}
