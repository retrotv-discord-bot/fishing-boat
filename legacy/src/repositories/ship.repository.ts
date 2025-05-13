import { Repository } from "typeorm";

import { AppDataSource } from "../config/datasource";

import ShipEntity from "../entities/ship.entity";

export default class ShipRepository extends Repository<ShipEntity> {
    private readonly repository: Repository<ShipEntity>;

    constructor() {
        super(ShipEntity, AppDataSource.createEntityManager());
        this.repository = AppDataSource.getRepository(ShipEntity);
    }

    async findByName(name: string): Promise<ShipEntity | null> {
        return this.repository.findOne({ where: { name } });
    }
}
