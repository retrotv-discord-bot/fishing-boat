import Alarm from "./alarm";

export default class AlarmEntity implements Alarm {
    vesselId: string;
    alarmTime: string;
    use: string;

    constructor(vesselId: string, alarmTime: string, use: string) {
        this.vesselId = vesselId;
        this.alarmTime = alarmTime;
        this.use = use;
    }

    public disable(): void {
        this.use = "N";
    }
}
