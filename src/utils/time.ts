export function validateDate(alarmTime: string): [boolean, string | null] {
    if (alarmTime) {
        alarmTime = alarmTime.trim();
        alarmTime = alarmTime.replace(":", "");
        alarmTime = alarmTime.replace(" ", "");

        if (alarmTime.length !== 4 && alarmTime.length !== 3) {
            return [false, "출항시간은 24시간 체계의 hhmm 혹은 hh:mm 형식으로 입력해주세요.\n예시: 18:30, 06:00, 9:00, 1000, 2030, 800"];
        }

        if (alarmTime.length === 3) {
            alarmTime = "0" + alarmTime;
        }

        const hh = parseInt(alarmTime.substring(0, 2), 10);
        const mm = parseInt(alarmTime.substring(2, 4), 10);
        if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
            return [false, "출항시간이 정상적인 시간의 범주가 아닙니다."];
        }

        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentAlarmTime = parseInt(currentHours.toString().padStart(2, "0") + currentMinutes.toString().padStart(2, "0"), 10);
        const inputAlarmTime = parseInt(alarmTime, 10);

        if (inputAlarmTime <= currentAlarmTime) {
            return [false, "출항시간은 현재 시간보다 미래로 설정해야 합니다."];
        }
    }

    return [true, null];
}
