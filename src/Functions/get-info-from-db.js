const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
});

async function getDbInfo(game, team) {
  return new Promise((resolve, reject) => {
    let teamInfo = `SELECT captain_userId AS captainId, 
                    coCaptain_userId AS coCaptainId,
                    captain_username AS captainUsername,
                    coCaptain_username AS coCaptainUsername,
                    time_zone AS timezone
                    FROM teams
                    WHERE team_name = ? AND game_name = ?`;

    db.get(teamInfo, [team, game], (err, row) => {
      if (err) {
        reject(err);
      }else if(!row) {
        resolve(false);
      } else {
        resolve({
          captainId: row.captainId,
          coCaptainId: row.coCaptainId,
          captainUsername: row.captainUsername,
          coCaptainUsername: row.coCaptainUsername,
          timezone: row.timezone
        });
      }
    });
  });
}

module.exports = { getDbInfo };

