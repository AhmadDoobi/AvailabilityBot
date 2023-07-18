const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const path = require('node:path');
const fs = require("node:fs");
const jsonFile = "./servers_info.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_team')
        .setDescription('register the game name, team name and the captin and co-captian roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('type the full game name ex: "pavlov shack" ')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('team_name')
                .setDescription('type the full team name')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('captain_role')
                .setDescription('type the captain role name')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('co-captain_role')
                .setDescription('type the co-captain role name')
                .setRequired(true)),

     
    async execute(interaction) {
        // Get the game name 
        const gameName = interaction.options.getString('game_name')
        // Get the team name 
        const teamName = interaction.options.getString('team_name')
        // Get the captain role ID
        const captainRoleName = interaction.options.getString('captain_role')
        // Get the co-captain role ID
        const coCaptainRoleName = interaction.options.getString('co-captain_role');
        // Check if the captain role exists
        const captainRole = interaction.guild.roles.cache.find(role => role.name === captainRoleName);
        if (!captainRole) {
            await interaction.reply({content: "The captain role was not found.", ephemeral: true});
              eturn;
        }
        
        // Check if the co-captain role exists
        const coCaptainRole = interaction.guild.roles.cache.find(role => role.name === coCaptainRoleName);
        if (!coCaptainRole) {
            await interaction.reply({content: "The co-captain role was not found.", ephemeral: true});
            return;
        }
        
        // Add the roles IDs to the JSON file
        const jsonData = JSON.parse(fs.readFileSync(jsonFile));
        jsonData[interaction.guild.id] = { 
            [gameName]: {
                'team': teamName,
                'captain': captainRoleName,
                'coCaptain': coCaptainRoleName,
            }
        };
        fs.writeFileSync(jsonFile, JSON.stringify(jsonData));
        
        await interaction.reply({content: `The game name has been set to "${gameName}", team name set to "${teamName}", captain role set to "${captainRoleName}" and the co-captain role was set to "${coCaptainRoleName}".`, ephemeral: true});
    },
};

