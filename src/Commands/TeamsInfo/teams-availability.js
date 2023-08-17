const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const teams = JSON.parse(fs.readFileSync('teams.json', 'utf8')).teams;
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const { teamsAvailabilityEmbed } = require('../../Embeds/teams-availability-embed')
const { specificTeamAvailabilityEmbed } = require('../../Embeds/specific-team-availability-embed')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teams-availability')
        .setDescription('get all teams, or a specific team availability')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('specific-team')
                .setDescription('check for a specific team availability')
                .addStringOption(option =>
                    option
                        .setName('game_name')
                        .setDescription('select the game')
                        .addChoices(...gameChoices)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('team_name')
                        .setDescription('select the team to check')
                        .addChoices(...teams)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('day')
                        .setDescription('select the day to check')
                        .setRequired(true)
                        .addChoices(
                            {name: 'monday', value: 'monday'},
                            {name: 'tuesday', value: 'tuesday'},
                            {name: 'wednesday', value: 'wednesday'},
                            {name: 'thursday', value: 'thursday'},
                            {name: 'friday', value: 'friday'},
                            {name: 'saturday', value: 'saturday'},
                            {name: 'sunday', value: 'sunday'},
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all-teams')
                .setDescription('check which teams have x or more amount of players in all days ')
                .addStringOption(option =>
                    option
                        .setName('game_name')
                        .setDescription('chose the game for the availability check')
                        .setRequired(true)
                        .addChoices(...gameChoices))
                .addIntegerOption(option =>
                    option
                        .setName('amount_of_players')
                        .setDescription('the amount of players to look for')
                        .setRequired(true)
                        .addChoices(
                            {name: '3', value: 3},
                            {name: '4', value: 4},
                            {name: '5', value: 5},
                            {name: '6', value: 6},
                            {name: '7', value: 7},
                            {name: '8', value: 8},
                            {name: '9', value: 9},
                            {name: '10', value: 10},
                ))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const gameName = interaction.options.getString('game_name');
        switch (subcommand) {
            case 'all-teams': {
                const amountOfPlayers = interaction.options.getInteger('amount_of_players');
                const embed = await teamsAvailabilityEmbed(gameName, amountOfPlayers);
                await interaction.reply({ embeds: [embed] });
            }
            return;

            case 'specific-team': {
                const teamName = interaction.options.getString('team_name');
                const day = interaction.options.getString('day');
                const embed = await specificTeamAvailabilityEmbed(gameName, teamName, day);
                await interaction.reply({ embeds: [embed] });
            }
        }

    }
}