import { DataSource } from "typeorm";
import fs from "fs";

import Logger from "../config/logtape";
const log = Logger(["bot", "datasource"]);

// ormconfig.json 파일 읽기
const config = JSON.parse(fs.readFileSync("ormconfig.json", "utf8"));

export const AppDataSource = new DataSource({
    ...config,
});

export const begin = async () => {
    log.debug("트랜잭션 시작");
    await AppDataSource.createQueryRunner().startTransaction();
};

export const commit = async () => {
    log.debug("트랜잭션 커밋");
    await AppDataSource.createQueryRunner().commitTransaction();
};

export const rollback = async () => {
    log.debug("트랜잭션 롤백");
    await AppDataSource.createQueryRunner().rollbackTransaction();
};

export const release = async () => {
    log.debug("트랜잭션 종료");
    await AppDataSource.createQueryRunner().release();
};
