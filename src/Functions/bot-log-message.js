const dotenv = require("dotenv");
dotenv.config();
const adminGuildUrl = process.env.ADMIN_GUILD_URL;
const botImage = process.env.BOT_IMAGE_URL;
const botOwnerImage = process.env.BOT_OWNER_IMAGE;
const botLogChannelId = process.env.BOT_LOG_CHANNEL_ID;

async function sendLog(client, logEmbed) {
    logEmbed
        .setTitle('AvailabilityBot Log')
        .setAuthor({name: 'AvailabilityBot', iconURL: botImage, url: adminGuildUrl})
        .setURL(adminGuildUrl)
        .setTimestamp()
        .setFooter({text: 'made by "a7a_." ', iconURL: botOwnerImage})
        
    const botLogChannel = client.channels.cache.get(botLogChannelId);
    await botLogChannel.send({ embeds: [logEmbed] });
    return;
}


module.exports = { sendLog };