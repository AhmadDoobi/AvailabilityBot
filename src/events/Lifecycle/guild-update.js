const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../../Functions/bot-log-message');

module.exports = {
    name: "guildUpdate",
    async execute(oldGuild, newGuild, client){
        if (oldGuild.name = newGuild.name){
            return;
        };
        
        const logEmbed = new EmbedBuilder()
            .setColor('#ADD8E6')
            .setDescription(`server: ${oldGuild.name} name was updated to ${newGuild.name}`);
        await sendLog(client, logEmbed);
        return;        
    }
}