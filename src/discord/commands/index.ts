import ContextMenuCommand from "../../templates/context-menu-command";
import PrefixCommand from "../../templates/prefix-command";
import SlashCommand from "../../templates/slash-command";
import contextUserinfo from "./context-menu/userinfo";
import slashPing from "./slash/ping";
import prefixPing from "./prefix/ping";

/*
 * 사용하는 컨텍스트 메뉴, 슬래시 명령어, 접두 명령어를 선언함. 선언된 명령어는 index.ts에서 호출됨.
 * Declare the context menu, slash commands, and prefix commands to be used. The declared commands are called in index.ts.
 */
export const contextMenuCommands: ContextMenuCommand[] = [contextUserinfo];
export const slashCommands: SlashCommand[] = [slashPing];
export const prefixCommands: PrefixCommand[] = [prefixPing];
