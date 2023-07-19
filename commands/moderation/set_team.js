const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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
                .setDescription('chose the game name ex: "pavlov shack" ')
                .setRequired(true)
                .addChoices(
                    {name: 'pavlov-shack', value: 'pavlov-shack'},
                    {name: 'breachers', value: 'breachers'},     
                ))
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
        // read the json file data
        const jsonData = JSON.parse(fs.readFileSync(jsonFile));
        // Get the game name 
        const gameName = interaction.options.getString('game_name')
        // Get the team name 
        const teamName = interaction.options.getString('team_name')
        // Get the captain role 
        const captainRoleName = interaction.options.getString('captain_role')
        // Get the co-captain role 
        const coCaptainRoleName = interaction.options.getString('co-captain_role');
        // check if the team name already exists, and if the command is being invoked from the same server the team was set on
        if (jsonData[gameName].hasOwnProperty(teamName) && interaction.guild.id != jsonData[gameName][teamName]["guild_id"]) {
            await interaction.reply({content: 'the team name you tried to set is already connected to another server. \nif you think this is a mistake please contact <a7a_.>', ephemeral: true});
            return
        }
        // Check if the captain role exists
        const captainRole = interaction.guild.roles.cache.find(role => role.name === captainRoleName);
        if (!captainRole) {
            await interaction.reply({content: "The captain role was not found.", ephemeral: true});
              return;
        }
        
        // Check if the co-captain role exists
        const coCaptainRole = interaction.guild.roles.cache.find(role => role.name === coCaptainRoleName);
        if (!coCaptainRole) {
            await interaction.reply({content: "The co-captain role was not found.", ephemeral: true});
            return;
        }
        
        // Add the roles IDs to the JSON file
        jsonData[gameName][teamName] = {
                'guild_id': interaction.guild.id, 
                'captain_role': captainRole.id,
                'coCaptain_role': coCaptainRole.id,
        };
        fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2));
        
        await interaction.reply({content: `The game name has been set to "${gameName}",\nteam name set to "${teamName}",\ncaptain role set to "${captainRoleName}",\nand the co-captain role was set to "${coCaptainRoleName}".` , ephemeral: true});
    },
};

