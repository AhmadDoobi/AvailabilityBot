const { SlashCommandBuilder, ChannelType, Client } = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const { getDbInfo } = require('../../Functions/get-info-from-db');
const { checkIfTeamHasAvailability } = require('../../Functions/db-checks')
const { deleteTeamAvailability } = require('../../Functions/delete-team-availability')
const { getTeamByGuild } = require('../../Functions/get-team-by-guild')
const { sendMessageAndStoreId } = require('../../Functions/send-times-message')
const { deleteTeamMessages } = require('../../Functions/delete-team-message')
const { deleteAllTeamTimesMessages } = require('../../Functions/delete-times-messages')
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
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('the channel for the times messages to be sent in')
                .addChannelTypes(ChannelType.GuildText)
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
    async execute(interaction, Client) {
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        })
        const timezone = interaction.options.getString('timezone');
        const gameName = interaction.options.getString('game_name');
        const eventsChannel = interaction.options.getChannel('channel');
        const eventsChannelId = eventsChannel.id;
        const callerGuildId = interaction.guild.id.toString();
        const callerId = interaction.user.id.toString();
        const { teamName } = await getTeamByGuild(callerGuildId, gameName);

        try {
            const teamInfo = await getDbInfo(gameName, teamName);
            teamGuildId = teamInfo.guildId;
            captainId = teamInfo.captainId;
            coCaptainId = teamInfo.coCaptainId;
            
        } catch (error) {
            console.log('There was an error getting team info:', error);
            await interaction.editReply({
                content: "there was an error, please try again. \nif this problem keeps happpning please contact <a7a_.>",
                ephemeral: true
            });
            return;
        }

        if (callerId !== captainId && callerId !== coCaptainId) {
            await interaction.editReply({
                content: "you need to be the team captain or co captain to reset the times!",
                ephemeral: true
            });
            return;
        }

        const teamHasAvailability = await checkIfTeamHasAvailability(teamName, gameName)
        if (!teamHasAvailability) {
            await interaction.editReply({
                content: 'your team still didnt register any times. use /set-times to register team times',
                ephemeral: true
            });
            return;
        }

        const daysArray = [];
        
        if (interaction.options.getBoolean('monday')) daysArray.push('monday');
        if (interaction.options.getBoolean('tuesday')) daysArray.push('tuesday');
        if (interaction.options.getBoolean('wednesday')) daysArray.push('wednesday');
        if (interaction.options.getBoolean('thursday')) daysArray.push('thursday');
        if (interaction.options.getBoolean('friday')) daysArray.push('friday');
        if (interaction.options.getBoolean('saturday')) daysArray.push('saturday');
        if (interaction.options.getBoolean('sunday')) daysArray.push('sunday');

        // Check if the daysArray is empty
        if (daysArray.length === 0) {
            await interaction.editReply({
                content: 'You must at least have one day chosen.',
                ephemeral: true
            });
            return; // Exit the command execution if no days were chosen
        }
        
        try{
            await deleteAllTeamTimesMessages(gameName, teamName, Client)
            await deleteTeamAvailability(teamName, gameName)
            await deleteTeamMessages(gameName, teamName)
        } catch(error) {
            console.log(error)
            await interaction.editReply({
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
            const role = interaction.options.getRole('team_members_role')
            let rolePingMessageId = "";
            if (role.mentionable) {
                const rolePingMessage = await eventsChannel.send(`Hey ${role}, please react to the times you're available in the messages below`);
                rolePingMessageId = rolePingMessage.id;
            } else {
                const warningMessage = await eventsChannel.send('The role you provided is not pingable. Please go to your server settings/roles/your team member role/ enable "allow anyone to @mention this role"');
                rolePingMessageId = warningMessage.id;
            }
            let insertQuery = `
                INSERT INTO messages (
                team_name,
                game_name,
                day,
                message_id
                )
                VALUES (?, ?, 'team member role message', ?);
            `;
            await new Promise((resolve, reject) => {
                db.run(insertQuery, [teamName, gameName, rolePingMessageId], function (err) {
                if (err) {
                    reject(`There was an error adding messages: ${err.message}`);
                } else {
                    resolve();
                }
                });
            });
            try {
                await new Promise((resolve, reject) => {
                    db.run(updateQuery, [eventsChannelId, teamMemberRoleId, timezone, gameName, teamName], function(err) {
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
                await interaction.editReply({
                    content: 'There was an error processing your request. Please try again. \nif this problem keeps happening please contact <a7a_.>',
                    ephemeral: true
                });
                return;
            }

        } else {
            const teamMemberRoleId = "not set";
            try {
                await new Promise((resolve, reject) => {
                    db.run(updateQuery, [eventsChannelId, teamMemberRoleId, timezone, gameName, teamName], function(err) {
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
                await interaction.editReply({
                    content: 'There was an error processing your request. Please try again. \nif this problem keeps happening please contact <a7a_.>',
                    ephemeral: true
                });
                return;
            }
        }

        const fromHour = interaction.options.getInteger('from_hour');
        const toHour = interaction.options.getInteger('to_hour');
        
        const timesArray = [];

        for (hour = fromHour; hour <= toHour; hour++){
            timesArray.push(hour)
        }

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
            const messageId = await sendMessageAndStoreId(eventsChannel, day, timesArray)
            let insertQuery = `
            INSERT INTO messages (
                team_name,
                game_name,
                day,
                message_id
            )
            VALUES (?, ?, ?, ?);
            `;
            await new Promise((resolve, reject) => {
                db.run(insertQuery, [teamName, gameName, day, messageId], function(err) {
                    if (err) {
                        reject(`There was an error adding messages: ${err.message}`);
                    } else {
                        resolve();
                    }
                });
            });
        }
        await interaction.editReply({
            content:`Successfully reset to the following days:\n${daysArray.join(", ")}\n\nAnd times:\n${timesArray.join(", ")}`,
            ephemeral: true
        });
    }
};
