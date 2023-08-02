const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

async function checkIfTeamAlreadyExists(gameName, teamName, guildId) {
    const selectQuery = `
      SELECT guild_id
      FROM teams
      WHERE game_name = ? AND team_name = ?;
    `;
  
    return new Promise((resolve, reject) => {
      db.get(selectQuery, [gameName, teamName], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          const teamGuildId = row.guild_id;
          if (guildId !== teamGuildId) {
            resolve(true); // Team name is associated with another server
          } else {
            resolve(false); // Team name is associated with the same server
          }
        } else {
          resolve(false); // Team name does not exist in the database
        }
      });
    });
}

async function checkIfGuildHasTeamForGame(guildId, gameName) {
    const selectQuery = `
        SELECT team_name
        FROM teams
        WHERE guild_id = ? AND game_name = ?;
        `;
          
    return new Promise((resolve, reject) => {
        db.all(selectQuery, [guildId, gameName], (err, rows) => {
            if (err) {
                reject(err);
            } else if (rows && rows.length > 0) {
                resolve(rows); // Guild already has teams for the given game
            } else {
                resolve(null); // Guild does not have any teams for the given game
            }
        });
    });
}

async function checkIfTeamHasAvailability(teamName, gameName) {
    const selectQuery = `
        SELECT team_name
        FROM availability
        WHERE team_name = ? AND game_name = ?;
        `;
          
    return new Promise((resolve, reject) => {
        db.get(selectQuery, [teamName, gameName], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve(true); // Team already has an entry for the given game
            } else {
                resolve(false); // Team does not have any entries for the given game
            }
        });
    });
}

module.exports = { checkIfGuildHasTeamForGame, checkIfTeamHasAvailability, checkIfTeamAlreadyExists }
