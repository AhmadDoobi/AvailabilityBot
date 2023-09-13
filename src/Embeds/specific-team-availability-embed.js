const { EmbedBuilder } = require('discord.js');
const dotenv = require("dotenv");
dotenv.config();
const adminGuildUrl = process.env.ADMIN_GUILD_URL;
const botImage = process.env.BOT_IMAGE_URL;
const botOwnerImage = process.env.BOT_OWNER_IMAGE;
const sqlite3 = require('sqlite3').verbose();
const { to24HourFormat, from24HourFormat, toUTC, fromUTC } = require('../Functions/timezone-conversions')
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

async function getTeamTimeZone(teamName, gameName) {
    return new Promise((resolve, reject) => {
        db.get("SELECT time_zone FROM teams WHERE team_name = ? AND game_name = ?", [teamName, gameName], (err, row) => {
            if (err) reject(err);
            resolve(row ? row.time_zone : null);
        });
    });
}

async function getCallerTimeZone(gameName, callerGuildId) {
  return new Promise((resolve, reject) => {
      db.get("SELECT time_zone FROM teams WHERE game_name = ? AND guild_id = ?", [gameName, callerGuildId], (err, row) => {
          if (err) reject(err);
          resolve(row ? row.time_zone : null);
      });
  });
}

async function getHourAvailability(gameName, teamName, day, hour) {
    return new Promise((resolve, reject) => {
        db.get( 
          "SELECT available_players AS playersCount FROM availability WHERE game_name = ? AND team_name = ? AND day = ? AND hour = ?", 
          [gameName, teamName, day, hour], 
          (err, row) => {
              if (err) reject(err);
              resolve(row ? {playersCount: row.playersCount} : {playersCount: null});
          });
      });
}

async function specificTeamAvailabilityEmbed(gameName, teamName, day, callerGuildId) {
  const embed = new EmbedBuilder()
    .setTitle(`AvailabilityBot team availability check`)
    .setAuthor({name: 'AvailabilityBot', iconURL: botImage, url: adminGuildUrl})
    .setColor('#10185a')
    .setURL(adminGuildUrl)
    .setTimestamp()
    .setFooter({text: 'made by "a7a_." ', iconURL: botOwnerImage});

  const callerTimezone = await getCallerTimeZone(gameName, callerGuildId);
  if (!callerTimezone || callerTimezone === 'not set'){
    embed.setDescription('you have to register your team before being able to uss this comamnd');
    return embed;
  }

  const teamTimezone = await getTeamTimeZone(teamName, gameName);
  if (teamTimezone === 'not set'){
    embed.setDescription('the team your checking the availability for didnt set there times yet');
    return embed;
  }

  embed.setDescription(`${day} availability for team: ${teamName}`)

  const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  let availableHours = 0;
  let dayTime = 'pm';
  for (const hour of hours) {
      if (hour === '12'){
        dayTime = 'am';
      }

      // Convert team's time to UTC
      let convertedTime = to24HourFormat(parseInt(hour, 10), dayTime);
      convertedTime = await toUTC(convertedTime.hour, day, teamTimezone);

      // Convert UTC time to caller's timezone
      convertedTime = await fromUTC(convertedTime.hour, convertedTime.day, callerTimezone);
      const hour12Format = from24HourFormat(convertedTime.hour);

      const availabilities = await getHourAvailability(gameName, teamName, day, hour);
      const playersCount = availabilities.playersCount;

      if (playersCount > 0) {
          embed.addFields({ 
              name: `${convertedTime.day}, ${hour12Format.hour} ${hour12Format.dayTime}`, 
              value: `available players: ${playersCount}` 
          })
          availableHours++;
      };
  }

  if (availableHours < 12 && availableHours > 0) {
      embed.addFields(
          { name: '-------------------------------------', value: '\u200B' },
          { name: 'done', value: `no available players for the rest of the day` }
      )
  } else if (availableHours < 1) {
      embed.addFields(
          { name: '-------------------------------------', value: '\u200B' },
          { name: 'done', value: `no available players for the whole day!` }
      )
  }
  return embed;
}

module.exports = { specificTeamAvailabilityEmbed }
