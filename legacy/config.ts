import dotenv from "dotenv";

dotenv.config();

const { BOT_TOKEN, BOT_ID } = process.env;
let { GUILD_ID, PREFIX } = process.env;

if (!BOT_TOKEN || !BOT_ID) {
    throw new Error("Missing environment variables");
}

GUILD_ID ??= "";
PREFIX ??= "!";

export const config = {
    BOT_TOKEN,
    BOT_ID,
    GUILD_ID,
    PREFIX,
};
