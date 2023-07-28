const { SlashCommandBuilder } = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let teamsFile = fs.readFileSync('teams.json', 'utf8');
let teams = JSON.parse(teamsFile);
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);
const { reloadTeamsAndGamesCommands } = require("../../Handlers/reload-commands");
const db = new sqlite3.Database('info.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

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
        .addStringOption(option =>
            option
                .setName('new_team_captain')
                .setDescription('set the new captain, if you dont want to change the team captain leave empty.')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('new_team_co-captain')
                .setDescription('set the new co-captain, if you dont want to change the team co-captain leave empty.')
                .setRequired(false))
}                