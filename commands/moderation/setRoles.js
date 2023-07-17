const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_roles')
        .setDescription('register the captin and co-captian roles')
};

