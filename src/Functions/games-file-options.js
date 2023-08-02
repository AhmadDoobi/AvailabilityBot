const fs = require('fs');
const games = fs.readFileSync('games.json', 'utf8');
const gameChoices = JSON.parse(games);
const { reloadTeamsAndGamesCommands } = require("../Handlers/reload-global-commands");

async function addGame(gameName, client){
    let state;

    let gameExists = gameChoices.some(game => game.name === gameName);
    if (gameExists){
        state = `the game: ${gameName}, is already in the json file no need to add it again`;
        return state;
    }
    try{
        let gameObject = {"name": gameName, "value": gameName};
        gameChoices.push(gameObject)
        fs.writeFileSync('games.json', JSON.stringify(gameChoices, null, 2));
        try {
            await reloadTeamsAndGamesCommands(client)           
        } catch(error){
            console.log(error)
            state = `game ${gameName}, successfully added to the games file, and commands were reloaded.\n❌❌❌ But there was an error reloading the commands.`;
            return state;
        }
        state = `game ${gameName}, successfully added to the games file, and commands were reloaded.`
        return state;
    } catch(error) {
        console.log(`there was an error: ${error}`)
        state = 'something went wrong, please try again';
        return state;
    }
}

async function deleteGame(gameName, client) {
    state = "still under development "
    return state;
}


module.exports = {addGame, deleteGame};