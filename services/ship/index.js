const { transactionStart, transactionCommit, transactionRollback } = require("../../databases");
const { shipDao } = require("../../dao/ship"); 
const { crewDao } = require("../../dao/crew");
const { alarmDao } = require("../../dao/alarm");
const crypto = require("crypto");

module.exports = {

  // 신규 어선 생성
  createNewShip: (interaction) => {
    const name = interaction.options.getString("선명");
    const channelId = interaction.channelId;
    const capacity = interaction.options.getInteger("인원수");
    const description = interaction.options.getString("설명") || "설명이 없습니다.";
    const alarmTime = interaction.options.getString("출항시간") || null;

    const clientId = interaction.user.id;
    const clientName = interaction.user.username;
    const clientGlobalName = interaction.user.globalName;
    const shipId = crypto.createHash("sha512").update(name + channelId).digest("hex");

    const isExist = shipDao.isExist(shipId, channelId);
    if (isExist) {
      return interaction.reply({ content: "이미 존재하는 어선입니다.", ephemeral: true });
    }

    try {
      transactionStart();
      shipDao.insertShip(shipId, name, channelId, capacity, description);
      crewDao.insertCrew(clientId, clientName, clientGlobalName, shipId, "선장");

      if (alarmTime) {
        alarmDao.insertAlarm(shipId, alarmTime);
      }

      transactionCommit();
    } catch (err) {
      console.error(err.message);
      transactionRollback();
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
    
    return interaction.reply({ embeds: [ shipEmbed ] });
  },

  // 어선 목록 조회
  searchAllShips: (interaction) => {
    const channelId = interaction.channelId;
    const ships = shipDao.selectAllShips(channelId);

    if (ships.length === 0) {
      return interaction.reply({ content: "어선이 존재하지 않습니다.", ephemeral: true });
    }

    const shipEmbeds = ships.map((ship) => ({
      color: 0x0099ff,
      title: ship.NAME,
      description: ship.DESCRIPTION,
      fields: [
        {
          name: "인원수",
          value: `총 ${ship.CAPACITY}명`,
        }
      ]
    }));

    return interaction.reply({ embeds: shipEmbeds, ephemeral: true });
  },

  // 어선 승선
  embark: (interaction) => {
    const crewId = interaction.user.id;
    const crewName = interaction.user.username;
    const crewGlobalName = interaction.user.globalName;
    const shipName = interaction.options.getString("선명");
    const channelId = interaction.channelId;

    // 어선 조회
    const ship = shipDao.selectShip(shipName, channelId);
    if (ship.length === 0) {
      return interaction.reply({ content: "해당 어선이 존재하지 않습니다.", ephemeral: true });
    }

    if (ship.length > 1) {
      return interaction.reply({ content: "두 개 이상의 어선이 감지되었습니다.\n문제가 지속될 경우, 관리자에게 문의하십시오.", ephemeral: true });
    }

    // 어선 탑승여부 확인
    const isExist = crewDao.isExist(crewId, ship[0].ID);
    if (isExist) {
      return interaction.reply({ content: "이미 해당 어선에 탑승하고 있습니다.", ephemeral: true });
    }

    const crewsCount = crewDao.selectAllCrewsCountInShip(shipName, channelId);
    const shipCapacity = ship[0].CAPACITY;
    if (crewsCount.length >= shipCapacity) {
      return interaction.reply({ content: "어선의 정원이 초과되었습니다.", ephemeral: true });
    }

    try {
      crewDao.insertCrew(crewId, crewName, crewGlobalName, ship[0].ID, "선원");
    } catch (err) {
      console.error(err.message);
      return interaction.reply({ content: "어선 승선에 실패했습니다.", ephemeral: true });
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
    
    return interaction.reply({ embeds: [ shipEmbed ] });
  },

  disembark: (interaction) => {
    const crewId = interaction.user.id;
    const shipName = interaction.options.getString("선명");
    const channelId = interaction.channelId;

    const crew = crewDao.selectCrew(crewId, shipName, channelId);
    if (crew.length === 0) {
      return interaction.reply({ content: "해당 어선에 탑승하고 있지 않습니다.", ephemeral: true });
    }

    let isCaptain = false;
    try {
      transactionStart();

      // 어선 하선
      crewDao.deleteCrew(crewId, shipName, channelId);

      // 하선한 선원의 역할이 선장일 경우, 어선도 같이 침몰
      if (crew[0].POSITION === "선장") {
        isCaptain = true;
        shipDao.deleteShip(shipName, channelId);
      }

      transactionCommit();
    } catch (err) {
      console.error(err.message);
      return interaction.reply({ content: "어선 하선에 실패했습니다.", ephemeral: true });
    }

    const shipEmbed = {
      color: 0x0099ff,
      title: shipName,
      description: "하선 완료!",
      timestamp: new Date(),
      footer: {
        text: "어선 하선 완료!",
      },
    };
    
    interaction.reply({ embeds: [ shipEmbed ], ephemeral: true });

    // 선장이 하선한 경우, 어선이 침몰되었다고 알림
    if (isCaptain) {
      const shipEmbed = {
        color: 0x0099ff,
        title: shipName,
        description: "어선이 침몰되었습니다!",
        timestamp: new Date(),
        footer: {
          text: "꼬르륵!",
        },
      };
      
      return interaction.channel.send({ embeds: [ shipEmbed ] });
    }
  },

  callingSailor: (interaction) => {
    const channel = interaction.channel;
    const channelId = interaction.channelId;
    const shipName = interaction.options.getString("선명");

    // 어선에 탑승한 선원들 조회
    const crews = crewDao.selectAllCrewInShip(shipName, channelId);

    if (crews.length === 0) {
      return interaction.reply({ content: "해당 어선에 탑승한 선원이 없습니다.", ephemeral: true });
    }

    const arrCrewId = crews.map((crew) => crew.USER_ID);
    let userMentions = arrCrewId.map((userId) => `<@${userId}>`).join(", ");
    userMentions = userMentions + " 선원들! 지금 당장 어선에 탑승하시오!";

    channel.send(userMentions);
    return interaction.reply({ content: "어선에 탑승한 인원들에게 알림을 보냈습니다.", ephemeral: true });
  }
}