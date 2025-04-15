const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("어선")
		.setDescription("거기 당신! 지금 당장 어선에 오르시오!")

    // /어선 생성 선명|"선명 입력" 인원수|"인원수 입력" + 1개 선택사항
    .addSubcommand((subcommand) =>
      subcommand
        .setName("생성")
        .setDescription("어선을 생성합니다.")
        .addStringOption((option) =>
          option
            .setName("선명")
            .setDescription("어선의 이름을 정합니다.")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("인원수")
            .setDescription("어선에 탑승할 인원수를 정합니다.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("설명")
            .setDescription("어떤 어선인지에 대한 설명을 정합니다.")
            .setRequired(false)
        )
      )
    
    .addSubcommand((subcommand) =>
      subcommand
        .setName("승선")
        .setDescription("지정한 어선에 승선합니다.")
        .addStringOption((option) =>
          option
            .setName("선명")
            .setDescription("승선할 어선을 선택합니다.")
            .setRequired(true),
        )
      )

    .addSubcommand((subcommand) =>
      subcommand
        .setName("하선")
        .setDescription("지정한 어선에서 하선합니다.")
        .addStringOption((option) =>
          option
            .setName("선명")
            .setDescription("하선할 어선을 선택합니다.")
            .setRequired(true),
        )
      )
    
    .addSubcommand((subcommand) =>
      subcommand
        .setName("여담")
        .setDescription("이 봇에 대한 여담을 알려드립니다.")
      )
    ,
	async execute(interaction) {

    // /어선 생성
		if (interaction.options.getSubcommand() === "생성") {
      const shipName = interaction.options.getString("선명");
      const shipMemberCount = interaction.options.getInteger("인원수");
      const shipDescription = interaction.options.getString("설명") || "설명이 없습니다.";
      const shipEmbed = {
        color: 0x0099ff,
        title: shipName,
        description: shipDescription,
        fields: [
          {
            name: "인원수",
            value: `총 ${shipMemberCount}명`,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "어선 생성 완료!",
        },
      };
      
      await interaction.reply({ embeds: [ shipEmbed ] });
    }

    if (interaction.options.getSubcommand() === "승선") {
      const shipName = interaction.options.getString("선명");
      const shipEmbed = {
        color: 0x0099ff,
        title: shipName,
        description: "승선 완료!",
        timestamp: new Date(),
        footer: {
          text: "어선 승선 완료!",
        },
      };
      
      await interaction.reply({ embeds: [ shipEmbed ] });
    }

    if (interaction.options.getSubcommand() === "하선") {
      const shipName = interaction.options.getString("선명");
      const shipEmbed = {
        color: 0x0099ff,
        title: shipName,
        description: "하선 완료!",
        timestamp: new Date(),
        footer: {
          text: "어선 하선 완료!",
        },
      };
      
      await interaction.reply({ embeds: [ shipEmbed ] });
    }

    if (interaction.options.getSubcommand() === "여담") {
      const shipEmbed = {
        color: 0x0099ff,
        title: "어선 여담",
        description: "이 봇에 사용된 그림은 사실 어선이 아닌 상선의 그림입니다. 그리고 아주 유명한 유령선이죠.\n꺄아아아악!"
      };
      
      await interaction.reply({ embeds: [ shipEmbed ] });
    }
	},
};
