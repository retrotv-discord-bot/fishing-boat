import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

import ContextMenuCommand from "../../../templates/context-menu-command";
import UserService from "../../../services/user-service";

export default new ContextMenuCommand({
    data: new ContextMenuCommandBuilder()
        .setName("Show user info")
        .setNameLocalizations({
            ko: "유저 정보 보기",
        })
        .setName("Collect user info")
        .setNameLocalizations({
            ko: "유저 정보 수집",
        })
        .setType(ApplicationCommandType.User),

    async execute(interaction): Promise<void> {
        if (!interaction.isUserContextMenuCommand()) {
            return;
        }

        const user = interaction.targetUser;

        if (interaction.commandName === "Show user info") {
            await interaction.reply({
                embeds: [
                    {
                        image: { url: user.displayAvatarURL() },
                        color: 0x0099ff,
                        title: `${user.username}`,
                        description: "유저 정보",
                    },
                ],
                ephemeral: true,
            });
        } else if (interaction.commandName === "Collect user info") {
            const userService = new UserService();

            try {
                await userService.saveUser(user.username);
            } catch (err: unknown) {
                await interaction.reply({
                    content: `유저 정보를 저장하는 도중 오류가 발생했습니다.\nError: ${err}`,
                    ephemeral: true,
                });

                return;
            }
        }
    },
});
