const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let teamsJson = JSON.parse(fs.readFileSync('teams.json', 'utf8'));
let teams = teamsJson.teams;
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);
const { reloadTeamsAndGamesCommands } = require("../../Handlers/reload-teams-games-commands");
const { checkIfTeamAlreadyExists, checkIfGuildHasTeamForGame } = require('../../Functions/db-checks');

const db = new sqlite3.Database('info.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register-team')
        .setDescription('register your team')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('chose the game name')
                .setRequired(true)
                .addChoices(...gameChoices))
        .addStringOption(option =>
            option
                .setName('team_name')
                .setDescription('type the full team name')
                .setRequired(true))
        .addUserOption(option =>
            option
                .setName('captain')
                .setDescription('set the team captain')
                .setRequired(true))
        .addUserOption(option =>
            option
                .setName('co-captain')
                .setDescription('set the team co-captain')
                .setRequired(true)),
    async execute(interaction, client) {
        await interaction.reply({
          content: 'processing...',
          ephemeral: true
        })
        // Get the game name 
        const gameName = interaction.options.getString('game_name');
        // Get the team name 
        const teamName = interaction.options.getString('team_name');
        // Get the captain username
        const captainUser = interaction.options.getUser('captain');
        // Get the co-captain username 
        const coCaptainUser = interaction.options.getUser('co-captain');
        //Get the captain user id
        const captainUserId = captainUser.id;
        // Get the co-captain user id 
        const coCaptainUserId = coCaptainUser.id;
        // Get the captain username
        const captainUsername = captainUser.username;
        // Get the co-captain username
        const coCaptainUsername = coCaptainUser.username;
        // Get the guild id 
        const guildId = interaction.guild.id;

        const teamExistsOnAnotherServer = await checkIfTeamAlreadyExists(gameName, teamName, guildId);
        if (teamExistsOnAnotherServer) {
            await interaction.editReply({ 
              content: 'The team name you tried to set is already connected to another server. \nif you think this is a mistake please contact <a7a_.>', 
              ephemeral: true });
            return;
        }
        const guildHasTeamForGame = await checkIfGuildHasTeamForGame(guildId, gameName);
        if (guildHasTeamForGame) {
            await interaction.editReply({ 
              content: 'Only one team is available per game for each server.\nif you wish to change your current team info and you are the captain or co-captain of the team use </reset-team-info>.\n otherwise contact <a7a_.>. ',
              ephemeral: true });
            return;
        }
        

        // Prepare the team object
        let teamObject = {"name": teamName, "value": teamName};

        // Check if the team already exists
        let teamExists = teams.some(team => team.name === teamName);

        if (!teamExists) {
          // Add the team to the game
          teams.push(teamObject);
          teamsJson["games per team name"][teamName] = 1;
            
        } else {
          teamsJson["games per team name"][teamName]++;            
        }
        fs.writeFileSync('teams.json', JSON.stringify(teamsJson, null, 2));

        const insertQuery = `
            INSERT INTO teams (guild_id, game_name, team_name, captain_userId, coCaptain_userId, captain_username, coCaptain_username, events_channelId, teamMember_roleId, time_zone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        try {
          await new Promise((resolve, reject) => {
              db.run(insertQuery, [guildId, gameName, teamName, captainUserId, coCaptainUserId, captainUsername, coCaptainUsername, 'not set', 'not set', 'not set'], function(err) {
                  if (err) {
                      console.error('Error inserting team:', err.message);
                      reject(err);
                  } else {
                      resolve();
                  }
              });
          });
        } catch (error) {
        console.log(`there was an error adding a team, ${error}`)
        await interaction.editReply({
          content: 'There was an error processing your request. Please try again. \nif this problem keeps happening please contact <a7a_.>',
          ephemeral: true
        });
        return;
        }

        const insideCommand = true;
        const gamesCommands = false;
        await reloadTeamsAndGamesCommands(client, insideCommand, gamesCommands)           

        await interaction.editReply({
          content: `The game name has been set to "${gameName}",\nteam name set to "${teamName}",\ncaptain username set to "${captainUsername}",\nand the co-captain username was set to "${coCaptainUsername}".`, 
          ephemeral: true
        });
    },
};

