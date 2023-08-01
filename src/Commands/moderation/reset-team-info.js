const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const teamsJson = JSON.parse(fs.readFileSync('teams.json', 'utf8'));
const { teams, "games per team name": gamesPerTeamName } = teamsJson;
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});
const { reloadTeamsAndGamesCommands } = require("../../Handlers/reload-global-commands");
const { getDbInfo } = require('../../Functions/get-info-from-db')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-team-info')
        .setDescription('reset a teams info, you must be the captian or co-captain of the team you want to reset.')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('chose the game for the team you want to reset')
                .setRequired(true)
                .addChoices(...gameChoices))
        .addStringOption(option =>
            option
                .setName('team_name')
                .setDescription('chose the team you want to reset the info for')
                .setRequired(true)
                .addChoices(...teams))
        .addStringOption(option =>
            option
                .setName('new_team_name')
                .setDescription('set the new team name, if you dont want to change the team name leave empty')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('new_team_captain')
                .setDescription('set the new captain, if you dont want to change the team captain leave empty.')
                .setRequired(false))
        .addUserOption(option =>
            option
                .setName('new_team_co-captain')
                .setDescription('set the new co-captain, if you dont want to change the team co-captain leave empty.')
                .setRequired(false)),
    async execute(interaction, client) {
        const gameName = interaction.options.getString('game_name');
        const teamName = interaction.options.getString('team_name');
        const newTeamName = interaction.options.getString('new_team_name');
        const callerGuildId = interaction.guild.id.toString();
        const callerId = interaction.user.id.toString();
        let teamGuildId;
        let captainId;
        let coCaptainId;
        let captainUpdated;
        let coCaptainUpdated;
        let teamNameUpdated;
        let updated = 0

        try {
            const teamInfo = await getDbInfo(gameName, teamName);
            teamGuildId = teamInfo.guildId;
            captainId = teamInfo.captainId;
            coCaptainId = teamInfo.coCaptainId;
            
        } catch (error) {
            console.log('There was an error getting team info:', error);
            await interaction.reply({
                content: "there was an error, please try again. \nif this problem keeps happpning please contact <a7a_.>",
                ephemeral: true
            });
            return;
        }

        if (callerGuildId !== teamGuildId) {
            await interaction.reply({
                content: "you can only change your teams info in the server connected to your team!",
                ephemeral: true 
            })
            return;
        }

        if (callerId !== captainId && callerId !== coCaptainId) {
            await interaction.reply({
                content: "you need to be the team captain or co captain to change its info!",
                ephemeral: true
            });
            return;
        }

        if(interaction.options.getUser('new_team_captain')) {
            const newCaptainId = interaction.options.getUser('new_team_captain').id.toString();
            const newCaptainUsername = interaction.options.getUser('new_team_captain').username;
            if(newCaptainId !== captainId){
                try {
                    await new Promise((resolve, reject) => {
                      let sql = `UPDATE Teams 
                                  SET captain_userId = ?, captain_username = ? 
                                  WHERE team_name = ? AND game_name = ?`;
                  
                      db.run(sql, [newCaptainId, newCaptainUsername, teamName, gameName], function(err) {
                        if (err) {
                            reject(`There was an error updating the team: ${teamName} ${err.message}`);
                        } else {
                            resolve(
                            captainUpdated = `team captain updated to ${newCaptainUsername}`,
                            updated += 1)
                        }
                      });
                    });
                } catch (error) {
                    console.error("error trying to update the new team captain: ", error);
                    captainUpdated = 'something went wrong while updating the team captain';
                }
                  
            }
        }
        
        if(interaction.options.getUser('new_team_co-captain')) {
            const newCoCaptainId = interaction.options.getUser('new_team_co-captain').id.toString();
            const newCoCaptainUsername = interaction.options.getUser('new_team_co-captain').username;
            if(newCoCaptainId !== coCaptainId){
                try {
                    await new Promise((resolve, reject) => {
                      let sql = `UPDATE Teams 
                                  SET coCaptain_userId = ?, coCaptain_username = ? 
                                  WHERE team_name = ? AND game_name = ?`;
                  
                      db.run(sql, [newCoCaptainId, newCoCaptainUsername, teamName, gameName], function(err) {
                        if (err) {
                            reject(`There was an error updating the team: ${teamName} ${err.message}`);
                        } else {
                            resolve(
                                coCaptainUpdated = `team co-captain updated to ${newCoCaptainUsername}`,
                                updated += 1
                            );
                        }
                      });
                    });
                } catch (error) {
                    console.error("error trying to update the new team co-captain: ", error);
                    coCaptainUpdated = 'something went wrong while updating the team co-captain';
                }
            }
        }

        if(interaction.options.getString('new_team_name')) {
            if(newTeamName !== teamName){
                try {
                    await new Promise((resolve, reject) => {
                      let sql = `UPDATE Teams 
                                  SET team_name = ?
                                  WHERE team_name = ? AND game_name = ?`;
                  
                      db.run(sql, [newTeamName, teamName, gameName], function(err) {
                        if (err) {
                          reject(`There was an error updating the team: ${teamName} ${err.message}`);
                        } else {
                            resolve(
                                teamNameUpdated = `team name updated to ${newTeamName}`,
                                updated += 1
                            );
                        }
                      });
                    });
                    if (gamesPerTeamName[teamName] <= 1) {
                        delete gamesPerTeamName[teamName];
                        teamsJson.teams = teams.filter(team => team.name !== teamName);
                    } else {
                        gamesPerTeamName[teamName]--;
                    }

                    if (teams.some(team => team.name === newTeamName)) {
                        gamesPerTeamName[newTeamName]++;
                    } else {
                        teamsJson.teams.push({ name: newTeamName, value: newTeamName });
                        gamesPerTeamName[newTeamName] = 1;
                    }

                    fs.writeFileSync('teams.json', JSON.stringify(teamsJson, null, 2));
                } catch (error) {
                    console.error("error trying to update the new team name: ", error);
                    teamNameUpdated = 'something went wrong while updating the team name';
                }
            }
        }

        if(updated > 0 ) {
            reloadTeamsAndGamesCommands(client);
        };

        if(teamNameUpdated || captainUpdated || coCaptainUpdated) {
            await interaction.reply({
                content: `${teamNameUpdated}, \n${captainUpdated}, \n${coCaptainUpdated}.`,
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: "nothing to update here, if this is a mistake please contact <a7a_.>.",
                ephemeral: true
            });
        }     
    }
}                