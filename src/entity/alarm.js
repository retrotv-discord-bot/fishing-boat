const AlarmEntity = require("./alarm.entity");

class Alarm {
    constructor(shipId, alarmTime, use = "Y") {
        this.shipId = shipId;
        this.alarmTime = alarmTime;
        this.use = use;
    }

    toEntity() {
        return new AlarmEntity(this.shipId, this.alarmTime, this.use);
    }
}

module.exports = Alarm;
