import type ContextMenuCommand from "../../templates/context-menu-command";
import type PrefixCommand from "../../templates/prefix-command";
import SlashCommand from "../../templates/slash-command";

import ship from "./ship";

export const contextMenuCommands: ContextMenuCommand[] = [];
export const slashCommands: SlashCommand[] = [ship];
export const prefixCommands: PrefixCommand[] = [];
