const sqlite3 = require('sqlite3').verbose();
const { sendMessageAndStoreId } = require('./send-times-message');
const { deleteTimesMessages } = require('./delete-times-messages');
const { resetAvailablePlayers } = require('./reset-available-players');
const { PermissionFlagsBits } = require('discord.js');

async function scheduleMessagesForTeams(client) {
  const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
  
  const teamsAndGames = await new Promise((resolve, reject) => {
    db.all("SELECT team_name, game_name, teamMember_roleId, events_channelId, captain_userId FROM teams", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  for (const { team_name: teamName, game_name: gameName, teamMember_roleId: roleId, events_channelId: channelId, captain_userId: captainId } of teamsAndGames) {
    if (channelId === 'not set') {continue;} 
    const eventsChannel = client.channels.cache.get(channelId);
    if (!eventsChannel) {continue;}
    const botPermissions = eventsChannel.permissionsFor(client.user);
    const requiredPermissions = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages | PermissionFlagsBits.AddReactions;
    if (!botPermissions.has(requiredPermissions)) {
      try{
        teamCaptain = client.users.cache.get(captainId);
        await teamCaptain.send(`I do not have the required permissions (View, Send, React) in the channel: ${eventsChannel.name}`);
      } catch {} finally {continue;}
    };

    const availability = await new Promise((resolve, reject) => {
      db.all(
        "SELECT day, hour FROM availability WHERE team_name = ? AND game_name = ?",
        [teamName, gameName],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const availabilityByDay = availability.reduce((acc, { day, hour }) => {
      acc[day] = acc[day] || [];
      acc[day].push(hour);
      return acc;
    }, {});

    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const sortedAvailability = daysOrder.filter(day => availabilityByDay[day]).map(day => [day, availabilityByDay[day]]);

    for (const [day, hours] of sortedAvailability) {
      await deleteTimesMessages(gameName, teamName, day, client);
      await resetAvailablePlayers(gameName, teamName, day);
      const messageId = await sendMessageAndStoreId(eventsChannel, day, hours);
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE messages SET message_id = ? WHERE game_name = ? AND team_name = ? AND day = ?",
          [messageId, gameName, teamName, day],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    const getRolePingMessageId = async (gameName, teamName) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT message_id FROM messages WHERE game_name = ? AND team_name = ? AND day = 'team member role message'`;
          db.get(sql, [gameName, teamName], (err, row) => {
          if (err) reject(err);
            resolve(row ? row.message_id : null);
          });
      });
    };

    let rolePingMessageId;
    try {
      const oldRolePingMessageId = await getRolePingMessageId(gameName, teamName);
      const oldRolePingMessage = await eventsChannel.messages.fetch(oldRolePingMessageId);
      await oldRolePingMessage.delete();
    } catch {} 
    
    // Check the role and send a message 
    if (roleId !== 'not set'){
      const role = eventsChannel.guild.roles.cache.get(roleId);
      if (role && role.mentionable) {
        const rolePingMessage = await eventsChannel.send(`
        Hey ${role}, please react to the times you're available in the messages above. for game ${gameName}`);
        rolePingMessageId = rolePingMessage.id;
      } else {
        const warningMessage = await eventsChannel.send(`
        hey, please react to the times your available in the messages above for game ${gameName}`);
        rolePingMessageId = warningMessage.id;
      }
    } else if (roleId === 'not set'){
      const rolePingMessage = await eventsChannel.send(`
        hey, please react to the times your available in the messages above for game ${gameName}`);
      rolePingMessageId = rolePingMessage.id}
    // Update the message ID in the database for the 'team member role message' day
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE messages SET message_id = ? WHERE game_name = ? AND team_name = ? AND day = 'team member role message'",
        [rolePingMessageId, gameName, teamName],
        (err) => {
        if (err) reject(err);
        else resolve();
        }
      );
    });
  }

  db.close((err) => {
    if (err) {
        console.error('Error closing the database:', err.message);
    }
  }); 

  return;
}

module.exports = {scheduleMessagesForTeams};