import { Repository } from "typeorm";

import { AppDataSource } from "../config/datasource";

import AlarmEntity from "../entities/alarm.entity";

export default class CrewRepository extends Repository<AlarmEntity> {
    private readonly repository: Repository<AlarmEntity>;

    constructor() {
        super(AlarmEntity, AppDataSource.createEntityManager());
        this.repository = AppDataSource.getRepository(AlarmEntity);
    }
}
