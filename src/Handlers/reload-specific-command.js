const { loadCommandFile } = require('../Functions/get-command-file')

async function reloadSpecificCommand(commandFolder, commandName, client){
    let commandCategory;
    let state;
    let command;

    switch (commandFolder){
        case 'bot_admin': {
            commandCategory = 'BotAdmin'
        }
        break;

        case 'help': {
            commandCategory = 'Help'
        }
        break;

        case 'match_setup': {
            commandCategory = 'MatchSetup'
        }
        break;

        case 'moderation': {
            commandCategory = 'Moderation'
        }
        break;

        case 'teams_info': {
            commandCategory = 'TeamsInfo'
        }
        break;
    }

    try{
        command = await loadCommandFile(commandCategory, commandName);
    } catch(error){
        console.log(error)
        state = 'something went wrong. please try again';
        return state
    }

    if (!('data' in command)){
        state = `❌❌❌ There is no data in command: ${command}!`
        return state
    } else if (!('execute' in command)){
        state = `🔴 There is no execute for command: ${command.data.name}!`
        return state
    }

    command.category = commandCategory;
    client.commands.set(command.data.name, command);

    if (commandCategory === 'BotAdmin'){
        const guildId = '1131204470274019368';
        const guild = client.guilds.cache.get(guildId);
        guild.commands.set([command.data]);
        state = `command ${command.data.name}, was successfully reloaded!`
        console.log(`command ${command.data.name}, was successfully reloaded!`)
        return state
    } else {
        client.application.commands.set([command.data]);
        state = `command ${command.data.name}, was successfully reloaded!`
        console.log(`command ${command.data.name}, was successfully reloaded!`)
        return state
    }
}

module.exports = {reloadSpecificCommand}