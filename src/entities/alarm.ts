import AlarmEntity from "./alarm.entity";

export default class Alarm {
    constructor(shipId: string, alarmTime: string, use: string) {
        this.shipId = shipId;
        this.alarmTime = alarmTime;
        this.use = use;

        console.log("어선 ID: ", this.shipId);
        console.log("출항시간: ", this.alarmTime);
        console.log("알람 사용 여부: ", this.use);
    }

    shipId: string;
    alarmTime: string;
    use: string = "Y";
    ship?: string;

    toEntity(): AlarmEntity {
        return new AlarmEntity(this.shipId, this.alarmTime, this.use);
    }
}
