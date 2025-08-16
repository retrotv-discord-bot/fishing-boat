import { PrismaClient } from "@prisma/client";
import Vessel from "../entities/vessel.entity";
import Logger from "../config/logtape";

export default class VesselRepository {
    private readonly client: PrismaClient;
    private readonly log = Logger(["bot", "VesselRepository"]);

    constructor(client: PrismaClient) {
        this.client = client;
    }

    public async save(vessel: Vessel): Promise<Vessel> {
        let savedVessel: Vessel | null = await this.client.vessels.findUnique({
            where: {
                id: vessel.id,
            },
        });

        // 이미 존재하는 어선인 경우, 예외 발생
        if (savedVessel !== null) {
            this.log.debug("이미 존재하는 어선입니다.");
            throw new Error("이미 존재하는 어선입니다.");
        }

        savedVessel = await this.client.vessels.create({
            data: vessel,
        });

        this.log.info("어선이 성공적으로 저장되었습니다.");
        this.log.debug(`저장된 어선 정보: ${JSON.stringify(savedVessel)}`);

        return savedVessel;
    }

    public async findById(id: string): Promise<Vessel | null> {
        return this.client.vessels.findUnique({
            where: {
                id,
            },
        });
    }

    public async findByNameAndChannelId(vesselName: string, channelId: string): Promise<Vessel | null> {
        return this.client.vessels.findFirst({
            where: {
                name: vesselName,
                channelId: channelId,
            },
        });
    }

    public async findByChannelId(channelId: string): Promise<Vessel[]> {
        return this.client.vessels.findMany({
            where: {
                channelId: channelId,
            },
        });
    }

    public async deleteVessel(vesselId: string): Promise<void> {
        // 어선 삭제
        await this.client.vessels.delete({
            where: {
                id: vesselId,
            },
        });
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
