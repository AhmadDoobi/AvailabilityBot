const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

async function setupDatabase() {
    try {
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS teams (
                guild_id TEXT NOT NULL,
                game_name TEXT NOT NULL,
                team_name TEXT NOT NULL,
                captain_userId TEXT NOT NULL,
                coCaptain_userId TEXT NOT NULL,
                captain_username TEXT NOT NULL,
                coCaptain_username TEXT NOT NULL,
                events_channelId TEXT NOT NULL,
                teamMember_roleId TEXT NOT NULL,
                time_zone TEXT NOT NULL,
                PRIMARY KEY (team_name, game_name)
            );`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS availability (
                team_name TEXT NOT NULL,
                game_name TEXT NOT NULL,
                day TEXT NOT NULL,
                hour TEXT NOT NULL,
                available_players INTEGER NOT NULL,
                PRIMARY KEY (team_name, game_name, day, hour)
            );`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        await new Promise((resolve, reject) => {
            db.run(`
            CREATE TABLE IF NOT EXISTS messages (
            game_name TEXT NOT NULL,
            team_name TEXT NOT NULL,
            day TEXT NOT NULL,
            message_id TEXT NOT NULL,
            PRIMARY KEY (game_name, team_name, day)
            );`, (err) => {
                if (err){
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        console.log('Tables created successfully.');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Closed the database connection. on setup-db.js');
        });
    }
    return; 
}

module.exports = {setupDatabase}
