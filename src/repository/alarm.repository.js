const { AppDataSource } = require("@/config/datasource");

module.exports = {
    alarmRepository: AppDataSource.getRepository("Alarm"),
};
