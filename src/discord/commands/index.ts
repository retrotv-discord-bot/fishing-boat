import type ContextMenuCommand from "../../templates/context-menu-command";
import type PrefixCommand from "../../templates/prefix-command";
import SlashCommand from "../../templates/slash-command";

import vessel from "./vessel";

export const contextMenuCommands: ContextMenuCommand[] = [];
export const slashCommands: SlashCommand[] = [vessel];
export const prefixCommands: PrefixCommand[] = [];
