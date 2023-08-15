const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
const { deleteTeamAvailability } = require('../../Handlers/delete-team-availability')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-team')
        .setDescription('reset team data in the json file')
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
                .setDescription('chose the team you want to reset the info for')
                .setRequired(true)
                .addChoices(...teams)),

    async execute(interaction, client){
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        })
        const gameName = interaction.options.getString('game_name');
        const teamName = interaction.options.getString('team_name');
        let state;

        await new Promise((resolve, reject) => {
            let deleteTeamQuery = `DELETE FROM teams WHERE team_name = ? AND game_name = ?`;

            db.run(deleteTeamQuery, [teamName, gameName], (err) => {
                if (err) {
                    reject(`There was an error deleting the team: ${teamName} ${err.message}`);
                } else {
                    resolve(`Team: ${teamName} deleted successfully.`);
                }
            });
        });
        state = await deleteTeamAvailability(teamName, gameName)
        if(teamsJson['games per team name'][teamName] > 1) {
            teamsJson['games per team name'][teamName]--;
        } else {
            delete teamsJson['games per team name'][teamName];
            teamsJson.teams = teamsJson.teams.filter(team => team.name !== teamName);
        }
        fs.writeFileSync('teams.json', JSON.stringify(teamsJson, null, 2));

        const insideCommand = true;
        const gamesCommands = false;
        await reloadTeamsAndGamesCommands(client, insideCommand, gamesCommands)           

        await interaction.editReply({
            content: `successfully deleted team ${teamName}, from game ${gameName}.\n and ${state}`,
            ephemeral: true
        });
    }
};