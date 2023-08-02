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

module.exports = {checkIfTeamAlreadyExists}