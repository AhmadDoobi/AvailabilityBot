const sqlite3 = require('sqlite3').verbose();

async function deleteTeamMessages(gameName, teamName){
  const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });

    let deleteQuery = `DELETE FROM messages WHERE team_name = ? AND game_name = ?`;
    let state;
    try {
        let changes = await new Promise((resolve, reject) => {
            db.run(deleteQuery, [teamName, gameName], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.changes);
              }
            });
        });
        state = `Rows deleted: ${changes} from team messages`
    } catch(err) {
        state = 'something went wrong while deleting team messages.'
        console.error(`Error occurred: ${err}`);
    }


    db.close((err) => {
      if (err) {
          console.error('Error closing the database:', err.message);
      }
    });

    return state
}

module.exports = { deleteTeamMessages };