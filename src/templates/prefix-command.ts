import { Message } from "discord.js";

export default class PrefixCommand {
    name: string;
    description: string;
    aliases?: string[];
    execute: (message: Message, args: string[]) => Promise<void> | void;

    constructor(object: {
        name: string;
        description: string;
        aliases?: string[];
        execute: (message: Message, args: string[]) => Promise<void> | void;
    }) {
        this.name = object.name;
        this.description = object.description;
        this.aliases = object.aliases;
        this.execute = object.execute;
    }
}
