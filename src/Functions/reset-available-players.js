const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    }
});

async function resetAvailablePlayers(gameName, teamName, day) {
    return new Promise((resolve, reject) => {
        const updateQuery = `
            UPDATE availability 
            SET available_players = 0
            WHERE game_name = ? AND team_name = ? AND day = ?
        `;

        db.run(updateQuery, [gameName, teamName, day], (err) => {
            if (err) {
                console.error('Error resetting available players:', err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = { resetAvailablePlayers }
