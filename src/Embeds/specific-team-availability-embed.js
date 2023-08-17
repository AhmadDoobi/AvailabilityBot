const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

// Fetch the timezone for a given team.
async function getTeamTimeZone(teamName, gameName) {
  return new Promise((resolve, reject) => {
      db.get("SELECT time_zone FROM teams WHERE team_name = ? AND game_name = ?", [teamName, gameName], (err, row) => {
          if (err) reject(err);
          resolve(row ? row.time_zone : null);
      });
  });
}

// Fetch the timezone for a given team.
async function getHourAvailability(gameName, teamName, day, hour) {
  try {
    return await new Promise((resolve, reject) => {
      db.get( 
        `
        SELECT available_players AS playersCount
        FROM availability 
        WHERE game_name = ? AND team_name = ? AND day = ? AND hour = ?
        `, 
        [gameName, teamName, day, hour], 
        (err, row) => {
          if (err) reject(err);
          resolve(row ? {playersCount: row.playersCount} : {playersCount: null});
        });
    });
  } catch(error) {
    console.log(error);
  }
}

async function specificTeamAvailabilityEmbed(gameName, teamName, day){
    const timezone = await getTeamTimeZone(teamName, gameName);
    const embed = new EmbedBuilder().setTitle(`${teamName}`).setDescription(`${day} availability / team timezone ${timezone}.`);
    const hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

    let availableHours = 0;
    for (const hour of hours) {
      const availabilities = await getHourAvailability(gameName, teamName, day, hour);
      const playersCount = availabilities.playersCount;
      if (!playersCount){
        continue;
      }
      if (playersCount > 0){
        embed.addFields({name: `${hour}pm`, value: `available players: ${playersCount}`})
        availableHours += 1;
      };
    }
    if (availableHours < 12 && availableHours > 0) {
      embed.addFields(
        { name: '\u200B', value: '\u200B' },
        {name:'done', value: `no available players for the rest of the day`}
      )
    } else if (availableHours < 1){
      embed.addFields(
        { name: '\u200B', value: '\u200B' },
        {name:'done', value: `no available players for the whole day!`}
      )
    }
    return embed
}

module.exports = { specificTeamAvailabilityEmbed }