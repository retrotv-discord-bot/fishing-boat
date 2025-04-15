const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

// 데이터베이스 파일 경로 설정
const dbPath = path.join(__dirname, '../fishing-ship.db');

// SQLite 데이터베이스 파일 생성 또는 연결
let database;
try {
  database = new DatabaseSync(dbPath);
  console.log('데이터베이스 연결 성공:', dbPath);
} catch (err) {
  console.error('데이터베이스 연결 실패:', err.message);
  process.exit(1);
}

module.exports = {
  db: database,

  transactionStart: () => {
    database.exec("BEGIN");
  },

  transactionCommit: () => {
    database.exec("COMMIT");
  },

  transactionRollback: () => {
    database.exec("ROLLBACK");
  },
}
