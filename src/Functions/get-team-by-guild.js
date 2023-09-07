const sqlite3 = require('sqlite3').verbose();

async function getTeamByGuild(guildId, gameName) {
    const db = new sqlite3.Database('info.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        }
    });

    try {
        return await new Promise((resolve, reject) => {
            let teamInfo = `SELECT team_name AS teamName 
                            FROM teams
                            WHERE guild_id = ? AND game_name = ?`;
        
            db.get(teamInfo, [guildId, gameName], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(false);
                } else {
                    resolve({
                        teamName: row.teamName
                    });
                }
            });
        });
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            }
        });
    }
}

module.exports = { getTeamByGuild };
