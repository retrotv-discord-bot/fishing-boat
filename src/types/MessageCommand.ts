import type { Message } from "discord.js";
import BaseCommand from "./BaseCommand.js";

export default class MessageCommand extends BaseCommand {
    aliases: string[];
    override execute: (message: Message, args: string[]) => Promise<void> | void;

    constructor(options: {
        name: string;
        description: string;
        aliases?: string[];
        execute: (message: Message, args: string[]) => Promise<void> | void;
    }) {
        super(options);
        this.execute = options.execute;
        this.aliases = options.aliases ?? [];
    }
}
