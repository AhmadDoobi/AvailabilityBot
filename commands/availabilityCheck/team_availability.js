const { SlashCommandBuilder } = require("discord.js");
const path = require('node:path');
const fs = require("node:fs");
const jsonFile = "./servers_info.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team_availability')
        .setDescription('displays a teams availability')
};