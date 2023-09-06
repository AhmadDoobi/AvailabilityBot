const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require('fs');
let teamsJson = JSON.parse(fs.readFileSync('teams.json', 'utf8'));
let teams = teamsJson.teams;
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});
const { reloadTeamsAndGamesCommands } = require("../../Handlers/reload-teams-games-commands");
const { deleteTeamAvailability } = require('../../Functions/delete-team-availability');
const { deleteTeamMessages } = require('../../Functions/delete-team-message');
const { deleteAllTeamTimesMessages } = require('../../Functions/delete-times-messages');
const { sendLog } = require('../../Functions/bot-log-message');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-team')
        .setDescription('delete all team info')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('select the game')
                .addChoices(...gameChoices)
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('team_name')
                .setDescription('chose the team you want to delete the info for')
                .setRequired(true)
                .addChoices(...teams)),

    async execute(interaction, client){
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        })

        const gameName = interaction.options.getString('game_name');
        const teamName = interaction.options.getString('team_name');
        let errorOccurred = false; 
        let state = '';

        state += await deleteAllTeamTimesMessages(gameName, teamName, client);
        
        await new Promise((resolve, reject) => {
            let deleteTeamQuery = `DELETE FROM teams WHERE team_name = ? AND game_name = ?`;
        
            db.run(deleteTeamQuery, [teamName, gameName], function(err) {  // Added 'function'
                if (err) {
                    reject(`There was an error deleting the team: ${teamName} ${err.message}`);
                } else {
                    if (this.changes === 0) {  // Check if any rows were deleted
                        reject(`There's no team with the name ${teamName} registered for the game ${gameName}!`);
                    } else {
                        resolve();
                    }
                }
            });
        }).catch(async (err) => {
            await interaction.editReply({
                content: err,  
                ephemeral: true
            });
            return errorOccurred = true
        })
        
        if (errorOccurred){
            return;
        }
        
        let log = "";
        const logEmbed = new EmbedBuilder()
            .setDescription(`Team: ${teamName} for game: ${gameName} was deleted`)
            .setColor('#820715');
        
        state += '\n';
        log = await deleteTeamMessages(gameName, teamName);
        logEmbed.addFields({name: log, value: '\u200B'});
        state += `${log}\n`;
        log = await deleteTeamAvailability(teamName, gameName);
        logEmbed.addFields({name: log, value: '\u200B'});
        state += `${log}\n`;

        if(teamsJson['games per team name'][teamName] > 1) {
            teamsJson['games per team name'][teamName]--;
        } else {
            delete teamsJson['games per team name'][teamName];
            teamsJson.teams = teamsJson.teams.filter(team => team.name !== teamName);
        }
        fs.writeFileSync('teams.json', JSON.stringify(teamsJson, null, 2));

        const insideCommand = false;
        const gamesCommands = false;
        state += await reloadTeamsAndGamesCommands(client, insideCommand, gamesCommands)           

        await interaction.editReply({
            content: `successfully deleted team ${teamName}, from game ${gameName}.\n and ${state}`,
            ephemeral: true
        });

        return await sendLog(client, logEmbed);
    }
};