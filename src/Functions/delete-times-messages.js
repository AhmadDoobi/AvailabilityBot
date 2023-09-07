const sqlite3 = require('sqlite3').verbose();

async function deleteAllTeamTimesMessages(gameName, teamName, client) {
    const db = new sqlite3.Database('info.db', (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
        }
    });

    try {
        let state = "";

        const sqlChannelId = `SELECT events_channelId FROM teams WHERE game_name = ? AND team_name = ?`;
        const sqlMessageIds = `SELECT message_id FROM messages WHERE game_name = ? AND team_name = ?`;

        const channelId = await new Promise((resolve, reject) => {
            db.get(sqlChannelId, [gameName, teamName], (err, row) => {
                if (err) reject(err);
                resolve(row ? row.events_channelId : null);
            });
        });

        const messageIds = await new Promise((resolve, reject) => {
            db.all(sqlMessageIds, [gameName, teamName], (err, rows) => {
                if (err) reject(err);
                resolve(rows ? rows.map(row => row.message_id) : []);
            });
        });

        if (!channelId || messageIds.length === 0) {
            state = 'No matching records found to delete the times messages.';
            return state;
        }

        let channel;
        try {
            channel = client.channels.cache.get(channelId);
        } catch {}

        for (const messageId of messageIds) {
            try {
                const message = await channel.messages.fetch(messageId);
                await message.delete();
            } catch (error) {}
        }

        state = 'Successfully deleted team messages.';
        return state;
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            }
        });
    }
}

async function deleteTimesMessages(gameName, teamName, day, client) {
    const db = new sqlite3.Database('info.db', (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
        }
    });

    try {
        const getChannelId = async () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT events_channelId FROM teams WHERE game_name = ? AND team_name = ?`;
                db.get(sql, [gameName, teamName], (err, row) => {
                    if (err) reject(err);
                    resolve(row ? row.events_channelId : null);
                });
            });
        };

        const getMessageId = async () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT message_id FROM messages WHERE game_name = ? AND team_name = ? AND day = ?`;
                db.get(sql, [gameName, teamName, day], (err, row) => {
                    if (err) reject(err);
                    resolve(row ? row.message_id : null);
                });
            });
        };

        const channelId = await getChannelId();
        const messageId = await getMessageId();

        if (!channelId || !messageId) {
            console.log('No matching records found.');
            return;
        }

        try {
            const channel = client.channels.cache.get(channelId);
            const message = await channel.messages.fetch(messageId);
            await message.delete();
            return;        
        } catch {}
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            }
        });
    }
}

module.exports = { deleteAllTeamTimesMessages, deleteTimesMessages};