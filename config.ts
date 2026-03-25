import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_ID = process.env.BOT_ID;
const DATABASE_URL = process.env.DATABASE_URL;

let GUILD_ID = process.env.GUILD_ID;
let PREFIX = process.env.PREFIX;

if (!BOT_TOKEN || !BOT_ID || !DATABASE_URL) {
    throw new Error("Missing environment variables");
}

GUILD_ID ??= "";
PREFIX ??= "!";

export const config = {
    BOT_TOKEN,
    BOT_ID,
    GUILD_ID,
    PREFIX,
    DATABASE_URL,
};
