const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

async function deleteTeamAvailability(teamName, gameName) {
    let deleteQuery = `DELETE FROM availability WHERE team_name = ? AND game_name = ?`;
    let state;
    try {
        let changes = await new Promise((resolve, reject) => {
            db.run(deleteQuery, [teamName, gameName], function(err) {
              if (err) {
                reject(err);  // Reject the promise with the error
              } else {
                resolve(this.changes);  // Resolve the promise with the number of changes
              }
            });
        });
        state = `Rows deleted: ${changes} from team availability`
    } catch(err) {
        state = 'something went wrong while deleting teamAvailability.'
        console.error(`Error occurred: ${err}`);
    }
    return state
}

module.exports = { deleteTeamAvailability };
