#!/usr/bin/env bash
set -euo pipefail

# 작업 디렉터리의 로그 폴더 준비
mkdir -p ./logs/pm2

# 소유권/권한은 필요에 따라 조정
chmod 0755 ./logs
chmod 0755 ./logs/pm2

# pm2 모듈 설치/설정 (pm2가 시스템에 설치되어 있어야 함)
# pm2가 로컬 node_modules에만 있다면 npx pm2 대신 pm2 사용 가능
if command -v pm2 >/dev/null 2>&1; then
    PM2=pm2
elif [ -x "./node_modules/.bin/pm2" ]; then
    PM2="./node_modules/.bin/pm2"
else
    PM2="npx pm2"
fi

# pm2-logrotate 설치
$PM2 install pm2-logrotate

# 기본 동작 설정 (필요시 값 조정)
$PM2 set pm2-logrotate:max_size 10M
$PM2 set pm2-logrotate:retain 14
$PM2 set pm2-logrotate:compress true
$PM2 set pm2-logrotate:dateFormat 'YYYY-MM-DD_HH-mm-ss'
$PM2 set pm2-logrotate:workerInterval 60

# 적용을 위해 PM2 재시작 (모듈 적용)
$PM2 restart all || true
$PM2 reloadLogs || true

echo "pm2 logrotate installed and configured."
