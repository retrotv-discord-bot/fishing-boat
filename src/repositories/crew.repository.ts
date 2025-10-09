import { PrismaClient } from "@prisma/client";
import Crew from "../entities/crew";
import CrewEntity from "../entities/crew.entity";
import Logger from "../config/logtape";

export default class CrewRepository {
    private readonly client: PrismaClient;
    private readonly log = Logger(["bot", "CrewRepository"]);

    constructor(client: PrismaClient) {
        this.client = client;
    }

    public async save(crew: Crew): Promise<CrewEntity> {
        let savedCrew: CrewEntity | null = await this.client.crews.findUnique({
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

    public async embarkCrew(crew: Crew, vesselId: string): Promise<Crew> {
        const isExists = await this.isExists(crew.id);

        this.log.debug(`승선 여부: ${isExists}`);

        const txResult = await this.client.$transaction(async (tx) => {
            this.log.debug("새로운 선원 추가 트랜잭션 시작");
            let newCrew = crew;
            if (!isExists) {
                newCrew = await tx.crews.create({
                    data: crew,
                });
            }
            this.log.debug("선원 추가 완료");

            this.log.debug("선원-어선 매핑 추가 트랜잭션 시작");
            const newVesselCrew = await tx.vesselsCrews.create({
                data: {
                    vesselId: vesselId,
                    crewId: crew.id,
                    position: "선원",
                },
            });
            this.log.debug("선원-어선 매핑 추가 완료");

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
