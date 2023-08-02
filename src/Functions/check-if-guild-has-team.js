const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});
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

module.exports = {checkIfGuildHasTeamForGame}