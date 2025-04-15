const { db } = require("../../databases");
const crypto = require('crypto');

module.exports = {

  // 신규 어선 생성
  createNewShip: (interaction) => {
    const name = interaction.options.getString("선명");
    const channelId = interaction.channelId;
    const capacity = interaction.options.getInteger("인원수");
    const description = interaction.options.getString("설명") || "설명이 없습니다.";

    const clientId = interaction.user.id;
    const shipId = crypto.createHash('sha512').update(name + channelId).digest('hex');

    db.run(`
      INSERT INTO SHIP (
            ID
          , NAME
          , CHANNEL_ID
          , CAPACITY
          , DESCRIPTION
      ) VALUES (
            ?
          , ?
          , ?
          , ?
          , ?
      )
          `, [
             shipId
           , name
           , channelId
           , capacity
           , description
       ],
      async (err) => {
        if (err) {
          console.error(err.message);
          return interaction.reply({ content: "어선 생성에 실패했습니다.", ephemeral: true });
        } else {
          db.run(`
            INSERT INTO CREW (
                  USER_ID
                , SHIP_ID
                , POSITION
            ) VALUES (
                  ?
                , ?
                , ?
            )
          `, [ clientId, shipId, "선장" ], async (err) => {
            if (err) {
              console.error(err.message);
              return interaction.reply({ content: "어선 생성에 실패했습니다.", ephemeral: true });
            }

            const shipEmbed = {
              color: 0x0099ff,
              title: name,
              description: description,
              fields: [
                {
                  name: "인원수",
                  value: `총 ${capacity}명`,
                }
              ],
              timestamp: new Date(),
              footer: {
                text: "어선 생성 완료!",
              },
            };
            
            await interaction.reply({ embeds: [ shipEmbed ] });
          })
        }
      }
    )
  },

  // 어선 승선
  joinShip: (interaction) => {
    const crewId = interaction.user.id;
    const shipName = interaction.options.getString("선명");
    const channelId = interaction.channelId;

    // 어선 조회
    db.get(`
      SELECT ID FROM SHIP WHERE NAME = ? AND CHANNEL_ID = ?
    ` , [ shipName, channelId ]
      , async (err, row) => {
          if (err) {
            console.error(err.message);
            return interaction.reply({ content: "어선 정보를 가져오는 데 실패했습니다.", ephemeral: true });
          }

          const shipId = row['ID'];
          if (!shipId) {
            return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", ephemeral: true });
          }

          console.log(crewId, shipId);

          // 어선에 탑승시키기
          db.run(`
            INSERT INTO CREW (USER_ID, SHIP_ID, POSITION)
            VALUES (?, ?, ?)
          `, [ crewId, shipId, "선원" ], async (err) => {
            if (err) {
              console.error(err.message);
              return interaction.reply({ content: "승선에 실패했습니다.", ephemeral: true });
            }

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
          });
        }
    );
  },

  callingSailor: (interaction) => {
    const channel = interaction.channel;
    const channelId = interaction.channelId;
      const shipName = interaction.options.getString("선명");

      // 어선에 탑승한 선원들 조회
      db.all(
        `SELECT C.USER_ID
           FROM CREW C
          INNER JOIN SHIP S
             ON C.SHIP_ID = S.ID
          WHERE S.NAME = ? AND S.CHANNEL_ID = ?`,
        [ shipName, channelId ],
        async (err, rows) => {
          if (err) {
            console.error(err.message);
            return interaction.reply({ content: "어선에 탑승한 인원의 정보를 가져오는 데 실패했습니다.", ephemeral: true });
          }

          if (rows.length === 0) {
            return interaction.reply({ content: "해당 어선에 탑승한 인원이 없습니다.", ephemeral: true });
          }
          
          const arrUserId = rows.map((row) => row.USER_ID);
          let userMentions = arrUserId.map((userId) => `<@${userId}>`).join(", ");
          userMentions = userMentions + " 선원들! 지금 당장 어선에 탑승하시오!";

          channel.send(userMentions);
          return interaction.reply({ content: "어선에 탑승한 인원들에게 알림을 보냈습니다.", ephemeral: true });
        }
      )
  }
}