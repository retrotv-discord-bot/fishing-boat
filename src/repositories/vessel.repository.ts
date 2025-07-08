import { PrismaClient } from "@prisma/client";
import Vessel from "../entities/vessel.entity";
import Crew from "../entities/crew.entity";
import Alarm from "../entities/alarm.entity";
import Logger from "../config/logtape";

export default class VesselRepository {
    private readonly client: PrismaClient;
    private readonly log = Logger(["bot", "VesselRepository"]);

    constructor(client: PrismaClient) {
        this.client = client;
    }

    public async findById(id: string): Promise<Vessel | null> {
        return await this.client.vessels.findUnique({
            where: {
                id,
            },
        });
    }

    public async findByNameAndChannelId(vesselName: string, channelId: string): Promise<Vessel | null> {
        return await this.client.vessels.findFirst({
            where: {
                name: vesselName,
                channelId: channelId,
            },
        });
    }

    public async findByChannelId(channelId: string): Promise<Vessel[]> {
        return await this.client.vessels.findMany({
            where: {
                channelId: channelId,
            },
        });
    }

    public async createNewVessel(vessel: Vessel, crew: Crew, alarm?: Alarm): Promise<Vessel> {
        const txResult = await this.client.$transaction(async (tx) => {
            // 어선 저장
            const newVessel = await tx.vessels.create({
                data: vessel,
            });

            // 선원(선장) 저장
            const newCaptain = await tx.crews.create({
                data: crew,
            });

            await tx.vesselsCrews.create({
                data: {
                    vesselId: newVessel.id,
                    crewId: newCaptain.id,
                    position: "선장",
                },
            });

            // 알람 저장
            let newAlarm;
            if (alarm !== null && alarm !== undefined) {
                newAlarm = await tx.alarms.create({
                    data: alarm,
                });
            }

            return { newVessel, newCaptain, newAlarm };
        });

        this.log.info("어선이 성공적으로 생성되었습니다.");
        this.log.debug(`어선 정보: ${JSON.stringify(txResult.newVessel)}`);
        this.log.debug(`선원 정보: ${JSON.stringify(txResult.newCaptain)}`);
        this.log.debug(`알람 정보: ${JSON.stringify(txResult.newAlarm)}`);

        this.client.$disconnect();

        return txResult.newVessel;
    }

    public async deleteVessel(vesselId: string): Promise<void> {
        this.client.$transaction(async (tx) => {
            // 알람 삭제
            tx.alarms.deleteMany({
                where: {
                    vesselId: vesselId,
                },
            });

            // 어선 - 선원 연관관계 삭제
            tx.vesselsCrews.deleteMany({
                where: {
                    vesselId: vesselId,
                },
            });

            // 어선 삭제
            tx.vessels.delete({
                where: {
                    id: vesselId,
                },
            });
        });

        this.client.$disconnect();
    }

    public async isExists(vesselName: string, channelId: string): Promise<boolean> {
        return (
            (await this.client.vessels.findFirst({
                where: {
                    name: vesselName,
                    channelId: channelId,
                },
            })) !== null
        );
    }
}
