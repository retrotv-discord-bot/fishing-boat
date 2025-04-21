/* eslint-disable @typescript-eslint/no-explicit-any */
import { begin, commit, rollback, release } from "../../config/datasource";

import AlarmRepository from "../../repositories/alarm.repository";
import CrewRepository from "../../repositories/crew.repository";
import ShipRepository from "../../repositories/ship.repository";

import Logger from "../../config/logtape";
import { LessThanOrEqual } from "typeorm";

export default class AlarmService {
    private readonly log = Logger(["bot", "ShipService"]);
    private readonly alarmRepository: AlarmRepository;
    private readonly crewRepository: CrewRepository;
    private readonly shipRepository: ShipRepository;

    constructor() {
        this.alarmRepository = new AlarmRepository();
        this.crewRepository = new CrewRepository();
        this.shipRepository = new ShipRepository();
    }

    public sendAlarm = async (client: any): Promise<void> => {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, "0");
        const currentMinute = String(now.getMinutes()).padStart(2, "0");
        const currentTime = currentHour + currentMinute;

        const alarms = await this.alarmRepository.find({
            where: {
                alarmTime: LessThanOrEqual(currentTime),
                use: "Y",
            },
        });

        alarms.forEach(async (alarm) => {
            const shipId = alarm.shipId;
            const ship = await this.shipRepository.findOne({
                where: {
                    id: shipId,
                },
            });

            if (!ship) {
                return;
            }

            const shipName = ship.name;
            const channelId = ship.channelId;

            const crews = await this.crewRepository.find({
                where: {
                    ship: {
                        name: shipName,
                        channelId: channelId,
                    },
                },
            });
            if (crews.length === 0) {
                return;
            }

            const crewIds = crews.map((crew) => crew.userId);

            let userMentions = `⛴️ 출항 알림: `;
            userMentions = userMentions + crewIds.map((userId) => `<@${userId}>`).join(", ");
            userMentions = userMentions + ` 선원들! 지금 당장 ${shipName}에 탑승하시오!`;

            try {
                const channel = await client.channels.fetch(channelId);
                channel.send(userMentions);
            } catch {
                console.error(`${channelId} 채널이 존재하지 않습니다.`);
            }

            try {
                await begin();

                // 알람 작동 끄기
                alarm.use = "N";
                await this.alarmRepository.save(alarm);

                await commit();
            } catch (err: unknown) {
                if (err instanceof Error) {
                    this.log.error("Error: " + err);
                }

                await rollback();
            } finally {
                await release();
            }
        });
    };
}
