const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS teams (
        guild_id TEXT PRIMARY KEY,
        game_name TEXT NOT NULL,
        team_name TEXT NOT NULL,
        captain_userId TEXT NOT NULL,
        coCaptain_userId TEXT NOT NULL,
        captain_username TEXT NOT NULL,
        coCaptain_username TEXT NOT NULL
      );
    `);
  }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_team')
        .setDescription('register the game name, team name and the captin and co-captian usernames and roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('chose the game name')
                .setRequired(true)
                .addChoices(
                    {name: 'pavlov-shack', value: 'pavlov-shack'},
                    {name: 'breachers', value: 'breachers'},
                    {name: 'pavlov-pc', value: 'pavlov-pc'},     
                ))
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
     
    async execute(interaction) {
        // Get the game name 
        const gameName = interaction.options.getString('game_name');
        // Get the team name 
        const teamName = interaction.options.getString('team_name');
        // Get the captain username
        const captainUser = interaction.options.getUser('captain');
        // Get the co-captain username 
        const coCaptainUser = interaction.options.getUser('co-captain')
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
        
        // check if the team name already exists
        async function checkIfTeamAlreadyExists(gameName, teamName, guildId) {
            const selectQuery = `
              SELECT guild_id
              FROM teams
              WHERE game_name = ? AND team_name = ?;
            `;
          
            return new Promise((resolve, reject) => {
              db.get(selectQuery, [gameName, teamName], (err, row) => {
                if (err) {
                  reject(err);
                } else if (row) {
                  const teamGuildId = row.guild_id;
                  if (guildId !== teamGuildId) {
                    resolve(true); // Team name is associated with another server
                  } else {
                    resolve(false); // Team name is associated with the same server
                  }
                } else {
                  resolve(false); // Team name does not exist in the database
                }
              });
            });
        }
        // Check if the guild already has a team for the specified game
        async function checkIfGuildHasTeamForGame(guildId, gameName) {
            const selectQuery = `
              SELECT team_name
              FROM teams
              WHERE guild_id = ? AND game_name = ?;
            `;
          
            return new Promise((resolve, reject) => {
              db.all(selectQuery, [guildId, gameName], (err, rows) => {
                if (err) {
                  reject(err);
                } else if (rows && rows.length > 0) {
                  resolve(rows); // Guild already has teams for the given game
                } else {
                  resolve(null); // Guild does not have any teams for the given game
                }
              });
            });
        }
        const teamExistsOnAnotherServer = await checkIfTeamAlreadyExists(gameName, teamName, guildId);
        if (teamExistsOnAnotherServer) {
            await interaction.reply({ content: 'The team name you tried to set is already connected to another server. \nif you think this is a mistake please contact <a7a_.>', ephemeral: true });
            return;
        }
        const guildHasTeamForGame = await checkIfGuildHasTeamForGame(guildId, gameName);
        if (guildHasTeamForGame) {
            await interaction.reply({ content: 'Only one team is available per game for each server.\nif you wish to change your current team info please contact <a7a_.>.', ephemeral: true });
            return;
        }
        
        const insertQuery = `
            INSERT INTO teams (guild_id, game_name, team_name, captain_userId, coCaptain_userId, captain_username, coCaptain_username)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        db.run(insertQuery, [guildId, gameName, teamName, captainUserId, coCaptainUserId, captainUsername, coCaptainUsername], function(err) {
            if (err) {
                console.error('Error inserting team:', err.message);
                return
            } 
        });
        await interaction.reply({content: `The game name has been set to "${gameName}",\nteam name set to "${teamName}",\ncaptain username set to "${captainUsername}",\nand the co-captain username was set to "${coCaptainUsername}".` , ephemeral: true});
    },
};

