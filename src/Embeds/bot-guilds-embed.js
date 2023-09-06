const { EmbedBuilder } = require('discord.js');
const dotenv = require("dotenv");
dotenv.config();
const adminGuildUrl = process.env.ADMIN_GUILD_URL;
const botImage = process.env.BOT_IMAGE_URL;
const botOwnerImage = process.env.BOT_OWNER_IMAGE;

async function botGuildsEmbed(client) {
    const embed = new EmbedBuilder()
        .setTitle('AvailabilityBot servers')
        .setAuthor({name: 'AvailabilityBot', iconURL: botImage, url: adminGuildUrl})
        .setURL(adminGuildUrl)
        .setTimestamp()
        .setFooter({text: 'made by "a7a_." ', iconURL: botOwnerImage})
        .setColor('#a0a090');

    const guilds = client.guilds.cache;
    guilds.forEach(guild => {
        embed.addFields({ name: guild.name, value: '\u200b' });
    });

    return embed;
}

module.exports = { botGuildsEmbed };