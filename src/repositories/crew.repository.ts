import { Repository } from "typeorm";

import { AppDataSource } from "../config/datasource";

import CrewEntity from "../entities/crew.entity";

export default class CrewRepository extends Repository<CrewEntity> {
    private readonly repository: Repository<CrewEntity>;

    constructor() {
        super(CrewEntity, AppDataSource.createEntityManager());
        this.repository = AppDataSource.getRepository(CrewEntity);
    }
}
