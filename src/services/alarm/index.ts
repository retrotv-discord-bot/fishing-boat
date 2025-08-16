import { PrismaClient } from "@prisma/client";
import prisma from "../../config/datasource";

import Logger from "../../config/logtape";
import AlarmRepository from "../../repositories/alarm.repository";
import CrewRepository from "../../repositories/crew.repository";
import VesselRepository from "../../repositories/vessel.repository";

export default class AlarmService {
    private readonly client: PrismaClient;
    private readonly alarmRepository: AlarmRepository;
    private readonly crewRepository: CrewRepository;
    private readonly vesselRepository: VesselRepository;
    private readonly log = Logger(["bot", "ShipService"]);

    public constructor() {
        this.client = prisma;
        this.alarmRepository = new AlarmRepository(this.client); 
        this.crewRepository = new CrewRepository(this.client);
        this.vesselRepository = new VesselRepository(this.client);
    }

    public sendAlarm = async (client: any): Promise<void> => {
        // 현재 시간과 동일하거나 이전인 알람들을 조회
        const alarms = await this.alarmRepository.findAlarmsTriggerd();

        if (alarms.length === 0) {
            return;
        }

        // 알람 작동
        for (const alarm of alarms) {
            const vessel = await this.vesselRepository.findById(alarm.vesselId);
            if (vessel === null) {
                continue;
            }

            const vesselName = vessel.name;
            const channelId = vessel.channelId;

            const crews = await this.crewRepository.findCrewsOnVessel(vesselName, channelId);
            if (crews.length === 0) {
                continue;
            }

            const crewIds = crews.map((crew) => crew.id);

            let userMentions = `⛴️ 출항 알림: `;
            userMentions = userMentions + crewIds.map((userId) => `<@${userId}>`).join(", ");
            userMentions = userMentions + ` 선원들! 지금 당장 ${vesselName}에 탑승하시오!`;

            try {
                const channel = await client.channels.fetch(channelId);
                channel.send(userMentions);
            } catch {
                this.log.error(`${channelId} 채널이 존재하지 않습니다.`);
            }

            try {
                const updatedAlarm = await this.client.$transaction(async (tx) => {
                    const txAlarmRepository = new AlarmRepository(tx as PrismaClient);
                    return await txAlarmRepository.save({
                        vesselId: alarm.vesselId,
                        alarmTime: alarm.alarmTime,
                        use: "N",
                    });
                });

                this.log.debug(`${vesselName} 어선에 알람 보냄`);
                this.log.debug(`작동이 꺼진 알람의 정보: ${JSON.stringify(updatedAlarm)}`);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    this.log.error("Error: " + err);
                }
            }
        }
    };
}
