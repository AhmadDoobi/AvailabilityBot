const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../../Functions/bot-log-message');

module.exports = {
    name: "guildCreate",
    async execute(guild, client){
        const logEmbed = new EmbedBuilder()
            .setColor('#008000')
            .setDescription(`Bot was added to server ${guild.name}`);
        await sendLog(client, logEmbed);
        return;        
    }
}