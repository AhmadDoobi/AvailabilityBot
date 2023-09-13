const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const teams = JSON.parse(fs.readFileSync('teams.json', 'utf8')).teams;
const { getDbInfo } = require('../../Functions/get-info-from-db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule-match')
        .setDescription('schedule a match with another team')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('select the game')
                .addChoices(...gameChoices)
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('team_name')
                .setDescription('chose the team you want to schedule with')
                .setRequired(true)
                .addChoices(...teams))
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
                ))
        .addStringOption(option => 
            option
                .setName('proposed_time')
                .setDescription('Enter the proposed time in HH:MM format')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('day_period')
                .setDescription('select the day period')
                .setRequired(true)
                .addChoices(
                    {name: 'AM', value: 'am'},
                    {name: 'PM', value: 'pm'},
                )),
    async execute(interaction, client){
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        });

        const callerGuildId = interaction.guild.id.toString();
        const gameName = interaction.options.getString('game_name');

        const teamNam = getTeamByGuild(callerGuildId, gameName);

        if (!teamNam){
            await interaction.editReply({
                content: 'theres no team registered for your guild with the game you chose!',
                ephemeral: true
            });
            return;
        }
    }
        
}