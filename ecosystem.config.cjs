module.exports = {
    apps: [
        {
            name: "fishing-vessel-bot",
            cwd: __dirname,
            script: "./index.ts",
            interpreter: "bun",
            out_file: "./logs/fishing-vessel-bot.out.log",
            error_file: "./logs/fishing-vessel-bot.error.log",
            pid_file: "./logs/fishing-vessel-bot.pid",
            merge_logs: true,
            exec_mode: "fork",
            instances: 1,
            autorestart: true,
            max_restarts: 10,
            restart_delay: 5000,
            kill_timeout: 10000,
            time: true,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
