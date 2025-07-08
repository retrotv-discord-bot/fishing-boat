import { Events, Message } from "discord.js";
import Event from "../../../templates/event";
import { config } from "../../../../config";
import PrefixCommand from "../../../templates/prefix-command";

export default new Event({
    name: Events.MessageCreate,
    async execute(message: Message): Promise<void> {
        if (!message.content.startsWith(config.PREFIX) || message.author.bot) {
            return;
        }

        if (!client.application?.owner) {
            await client.application?.fetch();
        }

        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = (<string>args.shift()).toLowerCase();

        const command =
            (client.prefixCommands.get(commandName) as PrefixCommand) ||
            (client.prefixCommands.find((cmd: PrefixCommand): boolean =>
                cmd.aliases ? cmd.aliases?.includes(commandName) : false,
            ) as PrefixCommand);

        if (!command) {
            return;
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
        }
    },
});
