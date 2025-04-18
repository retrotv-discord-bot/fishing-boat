const { DataSource } = require("typeorm");
const fs = require("fs");

// ormconfig.json 파일 읽기
const config = JSON.parse(fs.readFileSync("ormconfig.json", "utf8"));

const AppDataSource = new DataSource({
    ...config,
});

AppDataSource.initialize();

module.exports = {
    AppDataSource,
    begin: async () => {
        await AppDataSource.createQueryRunner().startTransaction();
    },

    commit: async () => {
        await AppDataSource.createQueryRunner().commitTransaction();
    },

    rollback: async () => {
        await AppDataSource.createQueryRunner().rollbackTransaction();
    },

    release: async () => {
        await AppDataSource.createQueryRunner().release();
    },
};
