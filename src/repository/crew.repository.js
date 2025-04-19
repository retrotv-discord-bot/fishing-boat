const { AppDataSource } = require("../config/datasource");

module.exports = {
    crewRepository: AppDataSource.getRepository("Crew"),
};
