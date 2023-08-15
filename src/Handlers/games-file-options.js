const fs = require('fs');
const { reloadTeamsAndGamesCommands } = require("./reload-teams-games-commands");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

async function addGame(gameName, client){
    let gamesFile = JSON.parse(fs.readFileSync('games.json', 'utf8'));
    let state;

    let gameExists = gamesFile.some(game => game.name === gameName);
    if (gameExists){
        state = `the game: ${gameName}, is already in the json file no need to add it again`;
        return state;
    }

    let gameObject = {"name": gameName, "value": gameName};
    gamesFile.push(gameObject)
    fs.writeFileSync('games.json', JSON.stringify(gamesFile, null, 2));
    const gamesCommands = true;
    const insideCommand = true;
    await reloadTeamsAndGamesCommands(client, insideCommand, gamesCommands)          
    state = `game ${gameName}, successfully added to the games file, and commands were reloaded.`
    return state;
}

async function deleteGame(gameName, client) {
    let teamsJson = JSON.parse(fs.readFileSync('teams.json', 'utf8'));
    let gamesFile = JSON.parse(fs.readFileSync('games.json', 'utf8'));

    let selectQueryTeams = `SELECT team_name FROM teams WHERE game_name = ?`
    let teamNamesArray = [];
    
    teamNamesArray = await new Promise((resolve,reject) => {
        db.all(selectQueryTeams, [gameName], function(err, rows) {
            if(err){
                reject(err);
            } else {
                resolve(rows.map(row => row.team_name));
            }
        });
    });

    let deleteQueryAvailability = `DELETE FROM availability WHERE game_name = ?`;
    let availabilityState;
    let teamsState;

    let changes = await new Promise((resolve, reject) => {
        db.run(deleteQueryAvailability, [gameName], function(err) {
            if (err) {
                reject(err);  // Reject the promise with the error
            } else {
                resolve(this.changes);  // Resolve the promise with the number of changes
            }
        });
    });
    availabilityState = `${changes} rows deleted from game availability`

    let deleteQueryTeams = `DELETE FROM teams WHERE game_name = ?`

    changes = await new Promise((resolve,reject) => {
        db.run(deleteQueryTeams, [gameName], function(err) {
            if(err){
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
    teamsState = `${changes} rows deleted from teams`

    teamNamesArray.forEach(teamNames => {
        if(teamsJson['games per team name'][teamNames] > 1) {
            teamsJson['games per team name'][teamNames]--;
        } else if(teamsJson['games per team name'][teamNames] < 2){
            delete teamsJson['games per team name'][teamNames];
            teamsJson.teams = teamsJson.teams.filter(team => team.name !== teamNames);
        }
    });
    fs.writeFileSync('teams.json', JSON.stringify(teamsJson, null, 2));
        
    gamesFile = gamesFile.filter(game => game.name !== gameName);
    fs.writeFileSync('games.json', JSON.stringify(gamesFile, null, 2));
    const insideCommand = true;
    const gamesCommands = true;
    await reloadTeamsAndGamesCommands(client, insideCommand, gamesCommands)         

    state = (`successfully deleted game \n${teamsState}\n${availabilityState}\nand commands were reloaded`)
    return state;
}


module.exports = {addGame, deleteGame};