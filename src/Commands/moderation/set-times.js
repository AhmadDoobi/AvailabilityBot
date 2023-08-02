const { SlashCommandBuilder } = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let teams = JSON.parse(fs.readFileSync('teams.json', 'utf8')).teams;
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-times')
        .setDescription('register the days and times you want to add for your team members to check their availability in')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('select the game')
                .addChoices(...gameChoices)
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('team')
                .setDescription('select your team')
                .addChoices(...teams)
                .setRequired(true))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('the channel for the times messages to be sent in')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('monday').setDescription('select if you want monday to be included').setRequired(true))
        .addBooleanOption(option =>
            option.setName('tuesday').setDescription('select if you want tuesday to be included').setRequired(true))
        .addBooleanOption(option =>
            option.setName('wednesday').setDescription('select if you want wednesday to be included').setRequired(true))
        .addBooleanOption(option =>
            option.setName('thursday').setDescription('select if you want thursday to be included').setRequired(true))
        .addBooleanOption(option =>
            option.setName('friday').setDescription('select if you want friday to be included').setRequired(true))
        .addBooleanOption(option =>
            option.setName('saturday').setDescription('select if you want saturday to be included').setRequired(true))
        .addBooleanOption(option =>
            option.setName('sunday').setDescription('select if you want sunday to be included').setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('from_hour')
                .setDescription('the hour to start the check from')
                .setRequired(true)
                .addChoices(
                    {name: '1pm', value: 1}, {name: '2pm', value: 2}, {name: '3pm', value: 3}, 
                    {name: '4pm', value: 4}, {name: '5pm', value: 5}, {name: '6pm', value: 6}
                ))
        .addIntegerOption(option =>
            option
                .setName('to_hour')
                .setDescription('the hour to finish the check in')
                .setRequired(true)
                .addChoices(
                    {name: '6pm', value: 6}, {name: '7pm', value: 7}, {name: '8pm', value: 8}, {name: '9pm', value: 9},
                    {name: '10pm', value: 10}, {name: '11pm', value: 11}, {name: '12pm', value: 12}
                ))  
        .addRoleOption(option =>
            option
                .setName('team_members_role')
                .setDescription('if you dont want the bot to ping the role leave empty')
                .setRequired(false)),
    async execute(interaction) {
        const gameName = interaction.options.getString('game_name');
        const teamName = interaction.options.getString('team_name');
        const eventsChannel = interaction.options.getChannel('channel').id;

        if(interaction.options.getRole('team_members_role')){
            const teamMemberRole = interaction.options.getRole('team_members_role');
            
        }

        const fromHour = interaction.options.getInteger('from-hour');
        const toHour = interaction.options.getInteger('to-hour');
        
        let hoursArray = [];
        const daysArray = [];
            
        if (interaction.options.getBoolean('monday')) daysArray.push('monday');
        if (interaction.options.getBoolean('tuesday')) daysArray.push('tuesday');
        if (interaction.options.getBoolean('wednesday')) daysArray.push('wednesday');
        if (interaction.options.getBoolean('thursday')) daysArray.push('thursday');
        if (interaction.options.getBoolean('friday')) daysArray.push('friday');
        if (interaction.options.getBoolean('saturday')) daysArray.push('saturday');
        if (interaction.options.getBoolean('sunday')) daysArray.push('sunday');

        for (let i = fromHour; i <= toHour; i++) {
            hoursArray.push(i);
        }
    }
};
