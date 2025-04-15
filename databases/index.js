const sqlite3 = require("sqlite3").verbose();

// SQLite 데이터베이스 파일 생성 또는 연결
module.exports = {
  db: new sqlite3.Database("./fishing-ship.db", (err) => {
    if (err) {
      console.error("Failed to connect to the database:", err.message);
      return;
    }

    console.log("Connected to the SQLite database.");
  })
}
