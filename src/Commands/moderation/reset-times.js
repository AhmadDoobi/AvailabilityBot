const { SlashCommandBuilder } = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let teams = JSON.parse(fs.readFileSync('teams.json', 'utf8')).teams;
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const { getDbInfo } = require('../../Functions/get-info-from-db');
const { checkIfTeamHasAvailability } = require('../../Functions/db-checks')
const { deleteTeamAvailability } = require('../../Functions/delete-team-availability')
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-times')
        .setDescription('reset the days and times for your team members to check their availability in')
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
        .addStringOption(option =>
            option
                .setName('timezone')
                .setDescription('select the timezone for your team')
                .setRequired(true)
                .addChoices(
                    {name: 'bst', value: 'bst'},
                    {name: 'est', value: 'est'},
                    {name: 'gmt', value: 'gmt'},
                ))    
        .addRoleOption(option =>
            option
                .setName('team_members_role')
                .setDescription('if you dont want the bot to ping the role leave empty')
                .setRequired(false)),
    async execute(interaction) {
        const timezone = interaction.options.getString('timezone');
        const gameName = interaction.options.getString('game_name');
        const teamName = interaction.options.getString('team_name');
        const eventsChannelId = interaction.options.getChannel('channel').id;
        const callerGuildId = interaction.guild.id.toString();
        const callerId = interaction.user.id.toString();

        try {
            const teamInfo = await getDbInfo(gameName, teamName);
            teamGuildId = teamInfo.guildId;
            captainId = teamInfo.captainId;
            coCaptainId = teamInfo.coCaptainId;
            
        } catch (error) {
            console.log('There was an error getting team info:', error);
            await interaction.reply({
                content: "there was an error, please try again. \nif this problem keeps happpning please contact <a7a_.>",
                ephemeral: true
            });
            return;
        }

        if (callerGuildId !== teamGuildId) {
            await interaction.reply({
                content: "you can only reset your teams times in the server connected to your team!",
                ephemeral: true 
            })
            return;
        }

        if (callerId !== captainId && callerId !== coCaptainId) {
            await interaction.reply({
                content: "you need to be the team captain or co captain to reset the times!",
                ephemeral: true
            });
            return;
        }

        const teamHasAvailability = await checkIfTeamHasAvailability(teamName, gameName)
        if (!teamHasAvailability) {
            await interaction.reply({
                content: 'your team still didnt register any times. use /set-times to register team times',
                ephemeral: true
            });
            return;
        }
        
        try{
            await deleteTeamAvailability(teamName, gameName)
        } catch(error) {
            console.log(error)
            await interaction.reply({
                content: 'something went wrong please try again',
                ephemeral: true 
            })
            return;
        }


        const updateQuery = `
            UPDATE teams 
            SET
                events_channelId = ?, teamMember_roleId = ?, time_zone = ?
            WHERE 
                game_name = ? AND team_name = ?;
            `;
        if(interaction.options.getRole('team_members_role')){
            const teamMemberRoleId = interaction.options.getRole('team_members_role').id;

            try {
                await new Promise((resolve, reject) => {
                    db.run(updateQuery, [teamMemberRoleId, eventsChannelId, gameName, teamName, timezone], function(err) {
                    if (err) {
                        console.error('Error inserting team:', err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                    });
                });
            } catch (error) {
                console.log(`there was an error adding a team, ${error}`)
                await interaction.reply({
                    content: 'There was an error processing your request. Please try again. \nif this problem keeps happening please contact <a7a_.>',
                    ephemeral: true
                });
                return;
            }

        } else {
            const teamMemberRoleId = "not set";
            try {
                await new Promise((resolve, reject) => {
                    db.run(updateQuery, [teamMemberRoleId, eventsChannelId, gameName, teamName], function(err) {
                    if (err) {
                        console.error('Error inserting team:', err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                    });
                });
            } catch (error) {
                console.log(`there was an error adding a team, ${error}`)
                await interaction.reply({
                    content: 'There was an error processing your request. Please try again. \nif this problem keeps happening please contact <a7a_.>',
                    ephemeral: true
                });
                return;
            }
        }

        const fromHour = interaction.options.getInteger('from_hour');
        const toHour = interaction.options.getInteger('to_hour');
        
        const daysArray = [];
        const timesArray = [];

        for (hour = fromHour; hour <= toHour; hour++){
            timesArray.push(hour)
        }

        if (interaction.options.getBoolean('monday')) daysArray.push('monday');
        if (interaction.options.getBoolean('tuesday')) daysArray.push('tuesday');
        if (interaction.options.getBoolean('wednesday')) daysArray.push('wednesday');
        if (interaction.options.getBoolean('thursday')) daysArray.push('thursday');
        if (interaction.options.getBoolean('friday')) daysArray.push('friday');
        if (interaction.options.getBoolean('saturday')) daysArray.push('saturday');
        if (interaction.options.getBoolean('sunday')) daysArray.push('sunday');

        try {
            for (let day of daysArray) {
                for (let hour of timesArray) {
                    let insertQuery = `
                        INSERT INTO availability (
                            team_name,
                            game_name,
                            day,
                            hour,
                            available_players
                        )
                        VALUES (?, ?, ?, ?, ?);
                    `;
                    await new Promise((resolve, reject) => {
                        db.run(insertQuery, [teamName, gameName, day, hour, 0], function(err) {
                            if (err) {
                                reject(`There was an error adding availability: ${err.message}`);
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            }
        } catch (error) {
            console.log(`There was an error processing your request: ${error}`)
            await interaction.reply({
                content: 'There was an error processing your request. Please try again. \nIf this problem keeps happening please contact <a7a_.>',
                ephemeral: true
            });
            return;
        }
        await interaction.reply({
            content:`Successfully reset to the following days:\n${daysArray.join(", ")}\n\nAnd times:\n${timesArray.join(", ")}`,
            ephemeral: true
        });
    }
};
