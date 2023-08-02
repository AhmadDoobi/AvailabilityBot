const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const fs = require('fs');
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);
const { addGame } = require('../../Functions/add-game');
const { deleteGame } = require('../../Functions/delete-game');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('games-file')
        .setDescription('adds or removes a game')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add_game')
                .setDescription('adds a game to the games file and reloads the commands.')
                .addStringOption(option =>
                    option
                        .setName('game_name')
                        .setDescription('the name of the game to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete_game')
                .setDescription('delets a game and all of the teams registered to that game.')
                .addStringOption(option =>
                    option
                        .setName('game_name')
                        .setDescription('the name of the game to add')
                        .addChoices(...gameChoices)
                        .setRequired(true))),
    async execute(interaction, client) {
        const gameName = interaction.options.getString('game_name');
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'add_game': {
                try {
                    const state = await addGame(gameName, client);
                    await interaction.reply({
                        content: state,
                        ephemeral: true
                    })          
                } catch(error){
                    console.log(error)
                    await interaction.reply({
                      content: `there was an error adding the game. please try again.`,
                      ephemeral: true 
                    });
                    return;
                }
            }
            break;

            case 'delete_game': {
                try{
                    const state = await deleteGame(gameName, client);
                    await interaction.reply({
                        content: state,
                        ephemeral: true
                    });     
                } catch(error){
                    console.log(error)
                    await interaction.reply({
                        content: `there was an error deleting the game info. please try again.`,
                        ephemeral: true 
                      });
                      return;
                }
            }
        }
    }
}