import {
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
} from "discord.js";

export default class ContextMenuCommand {
    data: ContextMenuCommandBuilder;
    execute?: (
        interaction:
            | ContextMenuCommandInteraction
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction,
    ) => Promise<void> | void;

    constructor(options: {
        data: ContextMenuCommandBuilder;
        execute?: (
            interaction:
                | ContextMenuCommandInteraction
                | UserContextMenuCommandInteraction
                | MessageContextMenuCommandInteraction,
        ) => Promise<void> | void;
    }) {
        this.data = options.data;
        this.execute = options.execute;
    }
}
