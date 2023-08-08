const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const teams = JSON.parse(fs.readFileSync('teams.json', 'utf8')).teams;
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const { getDbInfo } = require('../../Functions/get-info-from-db')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-team-info')
        .setDescription('get a team captain and co-captain usernames')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game_name')
                .setDescription('chose the game for the team you want to get the info for')
                .setRequired(true)
                .addChoices(...gameChoices))
        .addStringOption(option =>
            option
                .setName('team_name')
                .setDescription('chose the team you want to see the info for')
                .setRequired(true)
                .addChoices(...teams)),
    async execute(interaction) {
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        })
        const teamName = interaction.options.getString('team_name');
        const gameName = interaction.options.getString('game_name');
        let captainUsername;
        let coCaptainUsername;

        try {
            const teamInfo = await getDbInfo(gameName, teamName);
            captainUsername = teamInfo.captainUsername;
            coCaptainUsername = teamInfo.coCaptainUsername;
            await interaction.editReply({
                content: `team ${teamName}\n  captain: ${captainUsername}\n  co-captain ${coCaptainUsername}`,
                ephemeral: true
            })
        } catch(error) {
            await interaction.reply({
                content: "something went wrong while getting the team info please try again",
                ephemeral: true 
            });
            console.log(error);
            return
        }
    }
}