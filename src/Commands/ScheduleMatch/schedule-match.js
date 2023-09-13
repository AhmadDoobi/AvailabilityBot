const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const teams = JSON.parse(fs.readFileSync('teams.json', 'utf8')).teams;
const { getDbInfo } = require('../../Functions/get-info-from-db');
const { to24HourFormat, from24HourFormat, toUTC, fromUTC } = require('../Functions/timezone-conversions')

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

        const teamName = getTeamByGuild(callerGuildId, gameName);
        if (!teamName){
            await interaction.editReply({
                content: `theres no team registered in your guild for game ${gameName}!`,
                ephemeral: true
            });
            return;
        }

        const proposedTime = interaction.options.getString('proposed_time');
        const regex = /^((0?[1-9]|1[0-2]):[0-5][0-9]([AaPp][Mm])?|(1[3-9]|2[0-3]):[0-5][0-9])$/;
        if (!regex.test(proposedTime)) {
            await interaction.editReply({
                content: 'The proposed time is not in the correct HH:MM format and insure its in 12 hour format.',
                ephemeral: true
            });
            return;
        }
        let [hour, minute] = proposedTime.split(":");
        hour = parseInt(hour, 10);

        const opposingTeamName = interaction.options.getString('team_name');
        const opposingTeamInfo = await getDbInfo(gameName, opposingTeam);
        if (!opposingTeamInfo){
            await interaction.editReply({
                content: `The team ${opposingTeamName} doesnt exist for game ${gameName}.`,
                ephemeral: true
            });
            return;
        }

        const callerTeamInfo = getDbInfo(gameName, teamName);
        let day = interaction.options.getString('day')
        const dayTime = interaction.options.getString('day_period');

        // Convert the proposed time to 24-hour format
        const { hour: proposedHour24 } = to24HourFormat(hour, dayTime);

        // Convert the 24-hour format time to UTC
        const { hour: utcHour, day: utcDay } = await toUTC(proposedHour24, day, callerTeamInfo.timezone);

        // Convert the UTC time to the timezone of the opposing team
        const { hour: opposingTeamHour24, day: opposingTeamDay } = await fromUTC(utcHour, utcDay, opposingTeamInfo.timezone);

        // Convert the 24-hour format of the opposing team's time back to a 12-hour format
        const { hour: opposingTeamHour, dayTime: opposingTeamDayTime } = await from24HourFormat(opposingTeamHour24);

        const opposingTeamTime = `${opposingTeamDay}, ${opposingTeamHour}:${minute} ${opposingTeamDayTime}/ ${opposingTeamInfo.timezone}`;
        const callerTeamTime = `${day}, ${proposedTime} ${dayTime}/ ${callerTeamInfo.timezone}`;
    }
        
}