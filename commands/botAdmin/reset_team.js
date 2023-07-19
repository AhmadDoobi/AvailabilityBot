const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("node:fs");
const jsonFile = "./servers_info.json";


module.exports = {
    dat: new SlashCommandBuilder()
        .setName('reset_team')
        .setDescription('reset team data in the json file')
};