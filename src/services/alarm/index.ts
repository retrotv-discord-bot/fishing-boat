import { prisma, type PrismaExtendedClient } from "../../config/datasource";

import AlarmRepository from "../../repositories/alarm.repository";
import CrewRepository from "../../repositories/crew.repository";
import VesselRepository from "../../repositories/vessel.repository";
import { logger } from "../../config/logger";
import { TextChannel, type Client } from "discord.js";

export default class AlarmService {
    private readonly client: PrismaExtendedClient;
    private readonly alarmRepository: AlarmRepository;
    private readonly crewRepository: CrewRepository;
    private readonly vesselRepository: VesselRepository;

    public constructor() {
        this.client = prisma;
        this.alarmRepository = new AlarmRepository(this.client);
        this.crewRepository = new CrewRepository(this.client);
        this.vesselRepository = new VesselRepository(this.client);
    }

    public sendAlarm = async (client: Client): Promise<void> => {
        // 현재 시간과 동일하거나 이전인 알람들을 조회
        const alarms = await this.alarmRepository.findAlarmsTriggered();

        if (alarms.length === 0) {
            return;
        }

        logger.info(`알람이 ${alarms.length}개 있습니다.`);

        // 알람 작동
        for (const alarm of alarms) {
            const vessel = await this.vesselRepository.findById(alarm.vesselId);
            if (vessel === null) {
                logger.info(`알람이 설정된 어선 ${alarm.vesselId} 이 존재하지 않습니다.`);
                continue;
            }

            logger.info(`어선 명: ${vessel.name}`);
            logger.info(`채널 ID: ${vessel.channelId}`);

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
                if (channel !== null && channel instanceof TextChannel) {
                    await channel.send(userMentions);
                }
            } catch {
                logger.error(`${channelId} 채널이 존재하지 않습니다.`);
            }

            try {
                await this.client.$transaction(async (tx) => {
                    const txAlarmRepository = new AlarmRepository(tx as PrismaExtendedClient);
                    return await txAlarmRepository.save({
                        vesselId: alarm.vesselId,
                        alarmTime: alarm.alarmTime,
                        use: "N",
                    });
                });

                logger.debug(`${vesselName} 어선에 알람 보냄`);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    logger.error("Error: " + err.message);
                }
            } finally {
                await this.client.$disconnect();
            }
        }
    };
}
