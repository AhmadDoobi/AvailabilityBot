const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

async function reactionRemoveHandler(reaction, user) {
    // Ignore bot reactions
    if (user.bot) return;

    // Get the message ID from the reaction
    const messageId = reaction.message.id;

    const emojiToHourMap = {
        '1️⃣': 1,
        '2️⃣': 2,
        '3️⃣': 3,
        '4️⃣': 4,
        '5️⃣': 5,
        '6️⃣': 6,
        '7️⃣': 7,
        '8️⃣': 8,
        '9️⃣': 9,
        '🔟': 10,
        '🕚': 11,
    };

    // Query the SQLite3 database to see if the message ID exists
    const query = `SELECT game_name, team_name, day FROM messages WHERE message_id = ?`;

    return new Promise((resolve, reject) => {
        db.get(query, [messageId], (err, row) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }

            if (row) {
                const { game_name, team_name, day } = row;

                // Check if the day equals 'team member role message', then return
                if (day === 'team member role message') {
                    resolve(null);
                    return;
                }

                const emoji = reaction.emoji.name;
                const hour = emojiToHourMap[emoji];

                if (!hour) {
                    resolve(null);
                    return;
                }

                // Query to get the available players
                const getAvailableQuery = `
                    SELECT available_players
                    FROM availability
                    WHERE game_name = ? AND team_name = ? AND day = ? AND hour = ?
                `;

                db.get(getAvailableQuery, [game_name, team_name, day, hour], (getErr, availabilityRow) => {
                    if (getErr || !availabilityRow || availabilityRow.available_players <= 0) {
                        resolve(null);
                        return;
                    }

                    // Update the availability in the database by decrementing the available players
                    const updateQuery = `
                        UPDATE availability
                        SET available_players = available_players - 1
                        WHERE game_name = ? AND team_name = ? AND day = ? AND hour = ?
                    `;

                    db.run(updateQuery, [game_name, team_name, day, hour], updateErr => {
                        if (updateErr) {
                            reject(updateErr);
                        } else {
                            resolve(null);
                        }
                    });
                });
            } else {
                resolve(null);
            }
        });
    });
}

module.exports = { reactionRemoveHandler }
