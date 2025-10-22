import { PrismaClient } from "@prisma/client";
import Crew from "../entities/crew";
import Logger from "../config/logtape";

export default class CrewRepository {
    private readonly client: PrismaClient;
    private readonly log = Logger(["bot", "CrewRepository"]);

    constructor(client: PrismaClient) {
        this.client = client;
    }

    public async save(crew: Crew): Promise<Crew | null> {
        let savedCrew: Crew | null = await this.client.crews.findUnique({
            where: {
                id: crew.id,
            },
        });

        // 이미 존재하는 선원인 경우, 해당 엔티티를 반환함
        if (savedCrew !== null) {
            return savedCrew;
        }

        savedCrew = await this.client.crews.create({
            data: crew,
        });

        return savedCrew;
    }

    public async findCrewById(crewId: string): Promise<Crew | null> {
        return await this.client.crews.findUnique({
            where: {
                id: crewId,
            },
        });
    }

    public async findCrewOnVesselById(
        vesselName: string,
        channelId: string,
        crewId: string,
    ): Promise<
        | ({ vessels: { vesselId: string; crewId: string; position: string }[] } & {
              id: string;
              name: string;
              globalName: string;
          })
        | null
    > {
        return await this.client.crews.findUnique({
            where: {
                id: crewId,
                vessels: {
                    some: {
                        vessel: {
                            name: vesselName,
                            channelId: channelId,
                        },
                    },
                },
            },
            include: {
                vessels: true,
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
            include: {
                vessels: true,
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
        const crew = await this.client.crews.findUnique({
            where: {
                id: crewId,
                vessels: {
                    some: {
                        vesselId: vesselId,
                    },
                },
            },
        });

        return crew !== null;
    }

    public async embarkCrew(crew: Crew, vesselId: string): Promise<Crew | null> {
        const isExists = await this.isExists(crew.id);

        let newCrew = crew;
        if (!isExists) {
            newCrew = await this.client.crews.create({
                data: crew,
            });
        }

        await this.client.vesselsCrews.create({
            data: {
                vesselId: vesselId,
                crewId: crew.id,
                position: "선원",
            },
        });

        return newCrew;
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

    public async findMany(vesselName: string, channelId: string): Promise<Crew[]> {
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
            include: {
                vessels: true,
            },
        });
    }
}
