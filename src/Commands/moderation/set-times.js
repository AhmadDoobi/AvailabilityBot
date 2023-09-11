const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const gameChoices = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const { getDbInfo } = require('../../Functions/get-info-from-db');
const { checkIfTeamHasAvailability } = require('../../Functions/db-checks');
const {  getTeamByGuild } = require('../../Functions/get-team-by-guild');
const { sendMessageAndStoreId } = require('../../Functions/send-times-message');
const { sendLog } = require('../../Functions/bot-log-message');

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
                    {name: '10pm', value: 10}, {name: '11pm', value: 11},
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
                    {name: 'pst', value: 'pst'},
                    {name: 'cet', value: 'cet'},
                ))  
        .addRoleOption(option =>
            option
                .setName('team_members_role')
                .setDescription('if you dont want the bot to ping the role leave empty')
                .setRequired(false)),
    async execute(interaction, client) {
        await interaction.reply({
            content: 'processing...',
            ephemeral: true
        });

        const db = new sqlite3.Database('info.db', (err) => {
            if (err) {
              console.error('Error opening database:', err.message);
            }
        });

        const timezone = interaction.options.getString('timezone');
        const gameName = interaction.options.getString('game_name');
        const eventsChannel = interaction.options.getChannel('channel');
        const eventsChannelId = interaction.options.getChannel('channel').id;
        const callerGuildId = interaction.guild.id.toString();
        const callerId = interaction.user.id.toString();
        const { teamName } = await getTeamByGuild(callerGuildId, gameName)
        if (!teamName){
            await interaction.editReply({
                content: "Sorry, we couldn't find a registered team for your server in the chosen game.",
                ephemeral: true
            });
            return;
        }

        const teamInfo = await getDbInfo(gameName, teamName);
        if(!teamInfo){
             await interaction.editReply({
                content: "you didn't register your team yet. \nuse /register-team. \nif this is a mistake please contact <a7a_.>"
            });
                return;
        }

        teamGuildId = teamInfo.guildId;
        captainId = teamInfo.captainId;
        coCaptainId = teamInfo.coCaptainId;

        if (callerId !== captainId && callerId !== coCaptainId) {
            await interaction.editReply({
                content: "you need to be the team captain or co captain to set the times!",
                ephemeral: true
            });
            return;
        }

        const teamHasAvailability = await checkIfTeamHasAvailability(teamName, gameName)
        if (teamHasAvailability) {
            await interaction.editReply({
                content: 'your team has already set the times, if you want to reset them use /reset-times',
                ephemeral: true
            });
            return;
        }

        const botPermissions = eventsChannel.permissionsFor(client.user);
        const requiredPermissions = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages | PermissionFlagsBits.AddReactions;

        if (!botPermissions.has(requiredPermissions)) {
            return interaction.editReply(`I do not have the required permissions (View, Send, React) in the channel: ${eventsChannel.name}`);
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
                content: 'error, You must at least have one day chosen.',
                ephemeral: true
            });
            return; // Exit the command execution if no days were chosen
        }

        const logEmbed = new EmbedBuilder()
            .setDescription(`team ${teamName} for game ${gameName} has set their times!`)
            .setColor('#2196f3');
            
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
            logEmbed.addFields({name: `teammember role:`, value: role.name});
            let rolePingMessageId = "";
            if (role.mentionable) {
                const rolePingMessage = await eventsChannel.send(`Hey ${role}, please react to the times you're available in the messages below for game ${gameName}`);
                rolePingMessageId = rolePingMessage.id;
            } else {
                const warningMessage = await eventsChannel.send(`Hey, please react to the times you're available in the messages below for game ${gameName}. \nThe role you provided is not pingable. Please go to your server settings/roles/your team member role/ enable "allow anyone to @mention this role, or give the bot administrator permission "`);
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
            let rolePingMessageId = "";
            const teamMemberRoleId = "not set";
            try {
                const rolePingMessage = await eventsChannel.send(`Hey, please react to the times you're available in the messages below for game ${gameName}.`);
                rolePingMessageId = rolePingMessage.id
                console.log(rolePingMessageId)
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
            content:`Successfully set the following days:\n${daysArray.join(", ")}\n\nAnd times:\n${timesArray.join(", ")}.\n\ntimezone was set to ${timezone}. for team ${teamName}`,
            ephemeral: true
        });
        logEmbed
            .addFields({name: 'events channel:', value: eventsChannel.name})
            .addFields({name: 'days:', value: daysArray.join(", ")})
            .addFields({name: 'hours:', value: timesArray.join(", ")})
            .addFields({name: 'timezone:', value: timezone});

        await sendLog(client, logEmbed);

        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            }
        });
        
        return;
    }
};
