const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_roles')
        .setDescription('register the captin and co-captian roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('captain_role')
                .setDescription('the captian role name')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('co-captain_role')
                .setDescription('co-captian role name')
                .setRequired(true)),

     
    async execute(interaction) {
        // Get the captain role ID
        const captainRoleID = interaction.options.getString('captain_role');
        
        // Get the co-captain role ID
        const coCaptainRoleID = interaction.options.getString('co-captain_role');
        
        // Check if the captain role exists
        const captainRole = interaction.guild.roles.cache.find((role) => role.id === captainRoleID);
        if (!captainRole) {
            await interaction.reply("The captain role was not found.");
              eturn;
        }
        
        // Check if the co-captain role exists
        const coCaptainRole = interaction.guild.roles.cache.find((role) => role.id === coCaptainRoleID);
        if (!coCaptainRole) {
            await interaction.reply("The co-captain role was not found.");
            return;
        }
        
        // Add the roles IDs to the JSON file
        const jsonFile = path.join(__dirname, 'servers_info.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonFile));
        jsonData[interaction.guild.id] = {
            'captain': captainRoleID,
            'coCaptain': coCaptainRoleID,
        };
        fs.writeFileSync(jsonFile, JSON.stringify(jsonData));
        
        await interaction.reply("The captain and co-captain roles have been set.");
    }
};

