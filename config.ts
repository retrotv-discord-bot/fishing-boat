import dotenv from "dotenv";

dotenv.config();

const { DISCORD_BOT_TOKEN, CLIENT_ID, TO_REGISTER_GUILD } = process.env;

if (!DISCORD_BOT_TOKEN || !CLIENT_ID || !TO_REGISTER_GUILD) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_BOT_TOKEN,
  CLIENT_ID,
  TO_REGISTER_GUILD,
};
