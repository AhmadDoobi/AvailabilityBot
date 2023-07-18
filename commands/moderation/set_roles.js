const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_roles')
        .setDescription('register the captin and co-captian roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('captain_role')
                .setDescription('the captain role name')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('co-captain_role')
                .setDescription('co-captain role name')
                .setRequired(true)),

     
    async execute(interaction) {
        console.log("exucted command a")
        await interaction.reply("proccesing");
        // Get the captain role ID
        const captainRoleName = interaction.options.getString('captain_role');
        
        // Get the co-captain role ID
        const coCaptainRoleName = interaction.options.getString('co-captain_role');
        
        // Check if the captain role exists
        const captainRole = guild.roles.cache.find((role) => role === captainRoleName);
        if (!captainRole) {
            await interaction.editReply("The captain role was not found.");
              eturn;
        }
        
        // Check if the co-captain role exists
        const coCaptainRole = guild.roles.cache.find((role) => role === coCaptainRoleName);
        if (!coCaptainRole) {
            await interaction.editReply("The co-captain role was not found.");
            return;
        }
        
        // Add the roles IDs to the JSON file
        const jsonFile = path.join(__dirname, 'servers_info.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonFile));
        jsonData[interaction.guild.id] = {
            'captain': captainRoleName,
            'coCaptain': coCaptainRoleName,
        };
        fs.writeFileSync(jsonFile, JSON.stringify(jsonData));
        
        await interaction.editReply("The captain and co-captain roles have been set.");
    },
};

