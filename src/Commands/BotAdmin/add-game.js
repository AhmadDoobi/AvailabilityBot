const { SlashCommandBuilder, PermissionFlagsBits, Client} = require('discord.js');
const fs = require('fs');
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);
const { reloadTeamsAndGamesCommands } = require("../../Handlers/reload-global-commands");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-game')
        .setDescription('adds a game to the games file')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
                option
                    .setName('game_name')
                    .setDescription('the name of the game to add')
                    .setRequired(true)),

    async execute(interaction, client) {
        const gameName = interaction.options.getString('game_name');
        let gameObject = {"name": gameName, "value": gameName};
        let gameExists = gameChoices.some(game => game.name === gameName);
        if (gameExists){
            await interaction.reply({
                content: `the game: ${gameName}, is already in the json file no need to add it again`,
                ephemeral: true
            });
            return;
        }
        try{
            gameChoices.push(gameObject)
            fs.writeFileSync('games.json', JSON.stringify(gameChoices, null, 2));
            reloadTeamsAndGamesCommands(client)
            await interaction.reply({
                content: `game ${gameName}, successfully added to the games file, and commands were reloaded.`, 
                ephemeral: true
            });
        } catch(error) {
            console.log(`there was an error: ${error}`)
            return;
        }
    }
}