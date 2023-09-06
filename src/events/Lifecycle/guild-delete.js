const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../../Functions/bot-log-message');
const fs = require('fs');

module.exports = {
    name: "guildDelete",
    async execute(guild, client) {
        const sqlite3 = require("sqlite3").verbose();
        const db = new sqlite3.Database("info.db");
        const logEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`Bot was removed from server ${guild.name}`);

        try {
            const guildId = guild.id;
            const query = "SELECT team_name, game_name FROM teams WHERE guild_id = ?";

            const rows = await new Promise((resolve, reject) => {
                db.all(query, [guildId], (err, rows) => {
                    if (err) reject("Database error: " + err);
                    else resolve(rows);
                });
            });

            if (rows.length === 0) {
                logEmbed.addFields({name: 'No Data', value: 'There was no data for this guild.'});
                await sendLog(client, logEmbed);
                return;
            };

            // Read the 'teams.json' file
            const teamsJsonRaw = fs.readFileSync('teams.json', 'utf-8');
            const teamsJson = JSON.parse(teamsJsonRaw);
            
            // Add your extra functionality here
            rows.forEach(row => {
                const teamName = row.team_name;
                if (teamsJson['games per team name'][teamName] > 1) {
                    teamsJson['games per team name'][teamName]--;
                } else {
                    delete teamsJson['games per team name'][teamName];
                    teamsJson.teams = teamsJson.teams.filter(team => team.name !== teamName);
                }
            });
            
            // Write the updated JSON back to 'teams.json'
            fs.writeFileSync('teams.json', JSON.stringify(teamsJson, null, 2));
            
            let teamsDeleted;
            const deleteTeamsQuery = "DELETE FROM teams WHERE guild_id = ?";
            await new Promise((resolve, reject) => {
                db.run(deleteTeamsQuery, [guildId], function(err) {
                    if (err) reject("Error deleting from teams: " + err);
                    else {
                        teamsDeleted = this.changes;
                        resolve();
                    }
                });
            });

            logEmbed.addFields({name: 'Teams Table', value: `Rows deleted: ${teamsDeleted}`});

            const deletePromises = rows.map(row => {
                const { team_name, game_name } = row;

                const deleteMessagesQuery = "DELETE FROM messages WHERE team_name = ? AND game_name = ?";
                const deleteAvailabilityQuery = "DELETE FROM availability WHERE team_name = ? AND game_name = ?";

                const promise1 = new Promise((resolve, reject) => {
                    db.run(deleteMessagesQuery, [team_name, game_name], function(err) {
                        if (err) reject("Error deleting from messages: " + err);
                        else resolve(this.changes);
                    });
                });

                const promise2 = new Promise((resolve, reject) => {
                    db.run(deleteAvailabilityQuery, [team_name, game_name], function(err) {
                        if (err) reject("Error deleting from availability: " + err);
                        else resolve(this.changes);
                    });
                });

                return Promise.all([promise1, promise2]);
            });

            const results = await Promise.all(deletePromises);
            const messagesDeleted = results.map(r => r[0]).reduce((a, b) => a + b, 0);
            const availabilityDeleted = results.map(r => r[1]).reduce((a, b) => a + b, 0);

            logEmbed.addFields(
                {name: 'Messages Table', value: `Rows deleted: ${messagesDeleted}`},
                {name: 'Availability Table', value: `Rows deleted: ${availabilityDeleted}`}
            );

            await sendLog(client, logEmbed);

        } catch (error) {
            console.error(error);
        } finally {
            db.close((err) => {
                if (err) {
                    console.error("Error closing the database:", err);
                }
            });
            return;
        }
    }
};

