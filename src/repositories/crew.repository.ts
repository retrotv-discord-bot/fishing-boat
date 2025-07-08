import { PrismaClient } from "@prisma/client";
import Crew from "../entities/crew.entity";

export default class CrewRepository {
    private readonly client: PrismaClient;

    constructor(client: PrismaClient) {
        this.client = client;
    }

    public async findCrewById(crewId: string): Promise<Crew | null> {
        return await this.client.crews.findUnique({
            where: {
                id: crewId,
            },
        });
    }

    public async findCrewsOnVessel(vesselName: string, channelId: string): Promise<Crew[]> {
        return await this.client.crews.findMany({
            where: {
                vessels: {
                    some: {
                        vessel: {
                            name: vesselName,
                            channelId: channelId,
                        },
                    },
                },
            },
        });
    }

    public async findCrewsOnVesselByVesselId(vesselId: string): Promise<Crew[]> {
        return await this.client.crews.findMany({
            where: {
                vessels: {
                    some: {
                        vessel: {
                            id: vesselId,
                        },
                    },
                },
            },
        });
    }

    public async isCaptain(crewId: string, vesselId: string): Promise<boolean> {
        return (
            (await this.client.crews.findUnique({
                where: {
                    id: crewId,
                },
                include: {
                    vessels: {
                        where: {
                            vesselId: vesselId,
                            position: "선장",
                        },
                    },
                },
            })) !== null
        );
    }

    public async isExistsOnVessel(crewId: string, vesselId: string): Promise<boolean> {
        return (
            (await this.client.crews.findUnique({
                where: {
                    id: crewId,
                },
                include: {
                    vessels: {
                        where: {
                            vesselId: vesselId,
                        },
                    },
                },
            })) !== null
        );
    }

    public async embarkCrew(crew: Crew, vesselId: string): Promise<Crew> {
        const isExists = await this.isExists(crew.id);
        const txResult = await this.client.$transaction(async (tx) => {
            let newCrew = crew;
            if (!isExists) {
                newCrew = await tx.crews.create({
                    data: crew,
                });
            }

            const newVesselCrew = await tx.vesselsCrews.create({
                data: {
                    vesselId: vesselId,
                    crewId: crew.id,
                    position: "선원",
                },
            });

            return { newCrew, newVesselCrew };
        });

        this.client.$disconnect();

        return txResult.newCrew;
    }

    public async isExists(crewId: string): Promise<boolean> {
        return (
            (await this.client.crews.findUnique({
                where: {
                    id: crewId,
                },
            })) !== null
        );
    }
}
