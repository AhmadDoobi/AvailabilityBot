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

// Fetch teams with their availability for a given game on a given day.
async function getDayAvailability(gameName, day, amountOfPlayers) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT team_name, COUNT(*) as hours_count 
            FROM availability 
            WHERE game_name = ? AND day = ? AND available_players >= ?
            GROUP BY team_name;
        `, [gameName, day, amountOfPlayers], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

async function teamsAvailabilityEmbed(gameName, amountOfPlayers) {
    const embed = new EmbedBuilder().setTitle(`all teams`).setDescription(`Teams that have ${amountOfPlayers} or more players available`);
    let daysWithTeams = 0

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    try {
        for (const day of days) {
            let dayHasTeam = false;
            const availabilities = await getDayAvailability(gameName, day.toLowerCase(), amountOfPlayers);

            if (availabilities.length > 0) {
                let dayValue = '';
                dayHasTeam = true
                for (const availability of availabilities) {
                    const teamName = availability.team_name;
                    const hoursCount = availability.hours_count;
                    const timezone = await getTeamTimeZone(teamName, gameName);
                    dayValue += `${teamName}: in ${hoursCount} hours /timezone ${timezone}\n`;
                }

                embed.addFields({ name: day, value: dayValue });
            }
            if (dayHasTeam){
                daysWithTeams += 1;
            }
        }
        if (daysWithTeams > 0 && daysWithTeams < 7){
            embed.addFields(
                { name: '\u200b', value: '\u200b' },
                {name:'done', value: `no teams have ${amountOfPlayers} or more players available for the rest of the week!`}
            )
        } else if (daysWithTeams < 1){
            embed.addFields(
                { name: '\u200B', value: '\u200B' },
                {name:'done', value: `no teams have ${amountOfPlayers} or more players available for the whole week yet!`}
            )
        }

    } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
        throw new Error('Failed to create the embed.');
    }

    return embed;
}

module.exports = { teamsAvailabilityEmbed }