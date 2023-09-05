const { EmbedBuilder } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const adminGuildUrl = process.env.ADMIN_GUILD_URL;
const botImage = process.env.BOT_IMAGE_URL;
const botOwnerImage = process.env.BOT_OWNER_IMAGE;

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("info.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  }
});

async function registeredTeamsEmbed(client) {
  const embed = new EmbedBuilder()
    .setTitle("AvailabilityBot registired teams")
    .setDescription(
      "this is a list of all the registered teams in the bot data base"
    )

    .setURL(adminGuildUrl)

    .setAuthor({
      name: "AvailabilityBot",
      iconURL: botImage,
      url: adminGuildUrl,
    })

    .setTimestamp()

    .setFooter({
      text: 'made by "a7a_." ',
      iconURL: botOwnerImage,
    });

  const queryAll = async (db, query, params = []) => {
    return await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  const queryGet = async (db, query, params = []) => {
    return await new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  };

  try {
    const rows = await queryAll(
      db,
      "SELECT team_name, game_name, guild_id FROM teams"
    );

    for (const row of rows) {
      const { team_name, game_name, guild_id } = row;
      const availabilityRow = await queryGet(
        db,
        "SELECT COUNT(*) as count FROM availability WHERE team_name = ? AND game_name = ?",
        [team_name, game_name]
      );
      const hasSetTimes = availabilityRow.count > 0 ? "Yes" : "No";
      const guild = client.guilds.cache.get(guild_id);
      const guildName = guild?.name || "Unknown Guild";

      embed.addFields(
        {
          name: `Team ${team_name} for game ${game_name}`,
          value: `Team has set their times: ${hasSetTimes}. \nGuild for the team: ${guildName}`,
        },
        {
          name: "-------------------------------------",
          value: "\u200b",
        }
      );
    }
  } catch (err) {
    console.error(err);
  }
  return embed;
}

module.exports = { registeredTeamsEmbed };
