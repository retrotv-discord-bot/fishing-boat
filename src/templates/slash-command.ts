import type {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    InteractionResponse,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export default class SlashCommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
    execute?: (interaction: ChatInputCommandInteraction) => Promise<void | InteractionResponse<boolean>> | void;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void;

    constructor(options: {
        data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
        execute?: (interaction: ChatInputCommandInteraction) => Promise<void | InteractionResponse<boolean>> | void;
        autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void;
    }) {
        this.data = options.data;
        this.execute = options.execute;
        this.autocomplete = options.autocomplete;
    }
}
