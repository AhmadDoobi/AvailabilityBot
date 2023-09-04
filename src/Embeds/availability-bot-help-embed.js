const { EmbedBuilder } = require('discord.js');
const dotenv = require("dotenv");
dotenv.config();
const adminGuildUrl = process.env.ADMIN_GUILD_URL;
const botImage = process.env.BOT_IMAGE_URL;
const botOwnerImage = process.env.BOT_OWNER_IMAGE;
async function helpEmbed(){
    const embed = new EmbedBuilder()
        .setTitle('AvailabilityBot Help')
        .setURL(adminGuildUrl)
        .setAuthor({name: 'AvailabilityBot', iconURL: botImage, url: adminGuildUrl})
        .setColor('#00FFFF')
        .setDescription('here are the bot commands to help you get started.')
        .addFields(
            { 
                name: '⚠️ Important notes:', 
                value: 'make sure the bot has permission to send measages and react to them in the channel where you want the times measage to be sent in, also if you want the bot to ping the team members role make sure the role is ping able, finally make sure you register your team in your teams server' },
            { 
                name: '-------------------------------------', 
                value: '-------------------------------------' },
            { 
                name: 'register-team / reset-team-info', 
                value: "you need to start by registering your team's info in the bot data base, its an easy process just type /register-team and you will get the options, just start filling them. if for whatever reason you need to change your team's info later just use /reset-team-info and do the same process." },
            { 
                name: '-------------------------------------', 
                value: '\u200b' 
                },
            { 
                name: 'set-times / reset-times', 
                value: "after registering your team's info you need to set the times for the bot to check your team members availability in. set the channel where the times measage would be sent in, then the days, hours, and your team's timezone, finally your team members role for the bot to ping after sending the times measage. if you dont want the bot to ping the role simply leave empty, then the check measage will be sent every monday in the specified channel. if you ever want to reset any of the prevues info just use /reset-times and go through the same process" },
            { 
                name: '-------------------------------------', 
                value: '\u200b' },
            { 
                name: 'get-team-info', 
                value: "if you want to see another team's captain, co-captain and their time zone simply type /get-team-info and fill in the options" },
            { 
                name: '-------------------------------------', 
                value: '\u200b' },
            { 
                name: 'teams-availability all-teams', 
                value: "use 'teams-availability all-teams' to get a full print of all the teams that have a number of your chosen or more available players in all week, it would display the day then under the team names, next to each team it will show how many hours they have x amount of players or more in that day, then next to it it shows the team timezone "},
            { 
                name: '-------------------------------------', 
                value: '\u200b' },
            { 
                name: 'teams-availability specific-team', 
                value: "type 'teams-availability specific-team' then fill in the game for the team you want to check then the team name followed by the day to check in, this will display all the hours in the chosen day under each hour it'll show how many available players the chosen team has. " },
        )
        .setTimestamp()
        .setFooter({text: 'made by "a7a_." ', iconURL: botOwnerImage})
    
        return embed;
}

module.exports = { helpEmbed };