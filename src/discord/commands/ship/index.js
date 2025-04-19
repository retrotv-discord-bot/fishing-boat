const { createNewShip, sinkingShip, searchAllShips, searchCrewsInShip, embark, callingSailor, disembark } = require("../../../services/ship");
const { crewRepository } = require("../../../repository/crew.repository");
const { shipRepository } = require("../../../repository/ship.repository");

const { SlashCommandBuilder } = require("discord.js");
const { Like, In } = require("typeorm");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("어선")
        .setDescription("거기 당신! 지금 당장 어선에 오르시오!")

        // /어선 생성 선명|"선명 입력" 인원수|"인원수 입력" + 1개 선택사항
        .addSubcommand((subcommand) =>
            subcommand
                .setName("건조")
                .setDescription("어선을 생성합니다.")
                .addStringOption((option) => option.setName("선명").setDescription("어선의 이름을 정합니다.").setRequired(true))
                .addIntegerOption((option) => option.setName("인원수").setDescription("어선에 탑승할 인원수를 정합니다.").setRequired(true))
                .addStringOption((option) =>
                    option.setName("설명").setDescription("어떤 어선인지에 대한 설명을 정합니다.").setRequired(false),
                )
                .addStringOption((option) =>
                    option
                        .setName("출항시간")
                        .setDescription("어선의 출항시간을 정합니다. 시간은 24시간 체계로 입력하세요. (ex. 14:30, 08:30, 9:00, 2300, 930)")
                        .setRequired(false)
                        .setMinLength(3)
                        .setMaxLength(5),
                )
                .addBooleanOption((option) =>
                    option
                        .setName("중참가능여부")
                        .setDescription(
                            "중도 참여가 가능한지 여부를 정합니다. 기본 값은 True이며, 출항시간 값이 없는 경우 여기서 지정한 값과 관계없이 항상 True로 설정됩니다.",
                        )
                        .setRequired(false),
                ),
        )

        .addSubcommand((subcommand) =>
            subcommand
                .setName("침몰")
                .setDescription("어선을 침몰시킵니다. 해당 어선의 선장만 사용할 수 있습니다!")
                .addStringOption((option) =>
                    option.setName("선명").setDescription("침몰할 어선을 선택합니다.").setRequired(true).setAutocomplete(true),
                ),
        )

        .addSubcommand((subcommand) => subcommand.setName("목록").setDescription("어선 목록을 조회합니다."))

        .addSubcommand((subcommand) =>
            subcommand
                .setName("선원목록")
                .setDescription("어선에 탑승한 선원 목록을 조회합니다.")
                .addStringOption((option) =>
                    option.setName("선명").setDescription("어선의 이름을 입력하세요.").setRequired(true).setAutocomplete(true),
                ),
        )

        .addSubcommand((subcommand) =>
            subcommand
                .setName("승선")
                .setDescription("지정한 어선에 승선합니다.")
                .addStringOption((option) =>
                    option.setName("선명").setDescription("승선할 어선을 선택합니다.").setRequired(true).setAutocomplete(true),
                ),
        )

        .addSubcommand((subcommand) =>
            subcommand
                .setName("하선")
                .setDescription("지정한 어선에서 하선합니다.")
                .addStringOption((option) =>
                    option.setName("선명").setDescription("하선할 어선을 선택합니다.").setRequired(true).setAutocomplete(true),
                ),
        )

        .addSubcommand((subcommand) =>
            subcommand
                .setName("호출")
                .setDescription("어선에 탑승한 인원들에게 알림을 보냅니다.")
                .addStringOption((option) =>
                    option.setName("선명").setDescription("호출할 어선을 선택합니다.").setRequired(true).setAutocomplete(true),
                ),
        )

        .addSubcommand((subcommand) => subcommand.setName("여담").setDescription("이 봇에 대한 여담을 알려드립니다.")),
    async autocomplete(interaction) {
        if (interaction.options.getSubcommand() === "승선") {
            const focusedValue = interaction.options.getFocused();
            const ships = await shipRepository.find({
                where: {
                    name: Like(`%${focusedValue}%`),
                    channelId: interaction.channelId,
                },
            });
            const choices = ships.map((ship) => ship.name);
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
        }

        if (interaction.options.getSubcommand() === "침몰") {
            const focusedValue = interaction.options.getFocused();
            const joinedShips = await crewRepository.find({
                where: {
                    userId: interaction.user.id,
                    position: "선장",
                },
            });
            const shipIds = joinedShips.map((ship) => ship.shipId);
            const ships = await shipRepository.find({
                where: {
                    name: Like(`%${focusedValue}%`),
                    channelId: interaction.channelId,
                    id: In(shipIds),
                },
            });
            const choices = ships.map((ship) => ship.name);
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
        }

        if (interaction.options.getSubcommand() === "하선") {
            const focusedValue = interaction.options.getFocused();
            const joinedShips = await crewRepository.find({
                where: {
                    userId: interaction.user.id,
                },
            });
            const shipIds = joinedShips.map((ship) => ship.shipId);
            const ships = await shipRepository.find({
                where: {
                    name: Like(`%${focusedValue}%`),
                    channelId: interaction.channelId,
                    id: In(shipIds),
                },
            });
            const choices = ships.map((ship) => ship.name);
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
        }

        if (interaction.options.getSubcommand() === "선원목록") {
            const focusedValue = interaction.options.getFocused();
            const joinedShips = await crewRepository.find({
                where: {
                    userId: interaction.user.id,
                },
            });
            const shipIds = joinedShips.map((ship) => ship.shipId);
            const ships = await shipRepository.find({
                where: {
                    name: Like(`%${focusedValue}%`),
                    channelId: interaction.channelId,
                    id: In(shipIds),
                },
            });
            const choices = ships.map((ship) => ship.name);
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
        }

        if (interaction.options.getSubcommand() === "호출") {
            const focusedValue = interaction.options.getFocused();
            const joinedShips = await crewRepository.find({
                where: {
                    userId: interaction.user.id,
                },
            });
            const shipIds = joinedShips.map((ship) => ship.shipId);
            const ships = await shipRepository.find({
                where: {
                    name: Like(`%${focusedValue}%`),
                    channelId: interaction.channelId,
                    id: In(shipIds),
                },
            });
            const choices = ships.map((ship) => ship.name);
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
        }
    },

    async execute(interaction) {
        if (interaction.options.getSubcommand() === "건조") {
            createNewShip(interaction);
        }

        if (interaction.options.getSubcommand() === "침몰") {
            sinkingShip(interaction);
        }

        if (interaction.options.getSubcommand() === "목록") {
            searchAllShips(interaction);
        }

        if (interaction.options.getSubcommand() === "선원목록") {
            searchCrewsInShip(interaction);
        }

        if (interaction.options.getSubcommand() === "승선") {
            embark(interaction);
        }

        if (interaction.options.getSubcommand() === "호출") {
            callingSailor(interaction);
        }

        if (interaction.options.getSubcommand() === "하선") {
            disembark(interaction);
        }

        if (interaction.options.getSubcommand() === "여담") {
            const shipEmbed = {
                color: 0x0099ff,
                title: "어선 여담",
                description: "이 봇에 사용된 그림은 사실 어선이 아닌 상선의 그림입니다. 그리고 아주 유명한 유령선이죠.\n꺄아아아악!",
            };

            return interaction.reply({ embeds: [shipEmbed] });
        }
    },
};
