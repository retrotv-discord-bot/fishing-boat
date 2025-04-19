const { AppDataSource } = require("../config/datasource");

module.exports = {
    shipRepository: AppDataSource.getRepository("Ship"),
};
