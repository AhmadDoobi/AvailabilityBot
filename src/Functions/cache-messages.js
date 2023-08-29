async function cacheMessages(client) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('info.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        }
    });

    const emojiMap = {
        1: '1️⃣',
        2: '2️⃣',
        3: '3️⃣',
        4: '4️⃣',
        5: '5️⃣',
        6: '6️⃣',
        7: '7️⃣',
        8: '8️⃣',
        9: '9️⃣',
        10: '🔟',
        11: '🕚',
        12: '🕛'
    };

    const query = `
        SELECT messages.message_id, teams.team_name, teams.game_name, teams.events_channelId, messages.day
        FROM messages
        JOIN teams ON messages.team_name = teams.team_name AND messages.game_name = teams.game_name
        WHERE messages.day != 'team member role message'
    `;

    try {
        await new Promise((resolve, reject) => {
            db.all(query, async (err, rows) => {
                if (err) {
                    console.error("Database error:", err);
                    reject(err);
                    return;
                }

                const promises = [];

                for (const row of rows) {
                    const promise = new Promise(async (resolve, reject) => {
                        const channel = await client.channels.fetch(row.events_channelId);
                        const message = await channel.messages.fetch(row.message_id);

                        for (const [emoji, reaction] of message.reactions.cache) {
                            const correspondingHour = Object.keys(emojiMap).find(key => emojiMap[key] === emoji);

                            if (correspondingHour) {
                                const reactionCount = reaction.count - 1;
                                const fetchQuery = `
                                    SELECT available_players
                                    FROM availability
                                    WHERE team_name = ? AND game_name = ? AND day = ? AND hour = ?
                                `;

                                db.get(fetchQuery, [row.team_name, row.game_name, row.day, correspondingHour], (err, data) => {
                                    if (err) {
                                        console.error("Database fetch error:", err);
                                        reject(err);
                                        return;
                                    }

                                    if (data.available_players !== reactionCount) {
                                        const updateQuery = `
                                            UPDATE availability
                                            SET available_players = ?
                                            WHERE team_name = ? AND game_name = ? AND day = ? AND hour = ?
                                        `;

                                        db.run(updateQuery, [reactionCount, row.team_name, row.game_name, row.day, correspondingHour], (err) => {
                                            if (err) {
                                                console.error("Database update error:", err);
                                                reject(err);
                                                return;
                                            }
                                            resolve();
                                        });
                                    } else {
                                        resolve();
                                    }
                                });
                            }
                        }
                    });

                    promises.push(promise);
                }

                try {
                    await Promise.all(promises);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error(error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Closed the database connection. on cache-messages.js');
        });
    }
}

module.exports = { cacheMessages };

