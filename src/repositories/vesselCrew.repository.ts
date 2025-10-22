import { PrismaClient } from "@prisma/client";
import Logger from "../config/logtape";
import VesselCrew from "../entities/vesselCrew";
import Crew from "../entities/crew";

export default class VesselCrewRepository {
    private readonly client: PrismaClient;
    private readonly log = Logger(["bot", "VesselCrewRepository"]);

    constructor(client: PrismaClient) {
        this.client = client;
    }

    public async save(vesselCrew: VesselCrew): Promise<VesselCrew | null> {
        // 복합키를 사용한 findUnique
        let savedVesselCrew: VesselCrew | null = await this.client.vesselsCrews.findUnique({
            where: {
                vesselId_crewId: {
                    vesselId: vesselCrew.vesselId,
                    crewId: vesselCrew.crewId,
                },
            },
        });

        if (savedVesselCrew !== null) {
            throw new Error("해당 어선에 이미 탑승해 있습니다!");
        }

        savedVesselCrew = await this.client.vesselsCrews.create({
            data: vesselCrew,
        });

        return savedVesselCrew;
    }

    public async delete(crewId: string, vesselId: string): Promise<void> {
        await this.client.vesselsCrews.delete({
            where: {
                vesselId_crewId: {
                    vesselId: vesselId,
                    crewId: crewId,
                },
            },
        });
    }

    public async deleteMany(crews: Crew[]): Promise<void> {
        await this.client.vesselsCrews.deleteMany({
            where: {
                crewId: {
                    in: crews.map((crew) => crew.id),
                },
            },
        });
    }
}
