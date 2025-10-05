import { PrismaClient } from "@prisma/client";
import Alarm from "../entities/alarm";
import Logger from "../config/logtape";

export default class AlarmRepository {
    private readonly client: PrismaClient;
    private readonly log = Logger(["bot", "AlarmRepository"]);

    constructor(client: PrismaClient) {
        this.client = client;
    }

    public async save(alarm: Alarm): Promise<Alarm> {
        let savedAlarm: Alarm | null = await this.client.alarms.findUnique({
            where: {
                vesselId: alarm.vesselId,
            },
        });

        if (savedAlarm !== null) {
            savedAlarm = await this.client.alarms.update({
                where: {
                    vesselId: alarm.vesselId,
                },
                data: {
                    alarmTime: alarm.alarmTime,
                    use: alarm.use,
                },
            });
        } else {
            savedAlarm = await this.client.alarms.create({
                data: alarm,
            });
        }

        return savedAlarm;
    }

    public async findByVesselId(vesselId: string): Promise<Alarm | null> {
        return await this.client.alarms.findUnique({
            where: {
                vesselId: vesselId,
            },
        });
    }

    public async findAlarmsTriggerd(): Promise<Alarm[]> {
        // 현재 시간을 HHMM 형식으로 변환
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, "0");
        const currentMinute = String(now.getMinutes()).padStart(2, "0");
        const currentTime = currentHour + currentMinute;

        // 현재 시간과 동일하거나 이전인 알람들을 조회
        return await this.client.alarms.findMany({
            where: {
                alarmTime: {
                    lte: currentTime,
                },
                use: "Y",
            },
        });
    }
}
