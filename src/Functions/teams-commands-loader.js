const fs = require('node:fs');
const path = require('node:path');

function deleteCachedFile(itemPath) {
    if (require.cache[itemPath]) {
        delete require.cache[itemPath];
    }
}

function getFiles(folderPath) {
    let files = [];

    // Define specific paths to include
    const includePaths = [
        'BotAdmin/delete-team.js',
        'TeamsInfo',
        'MatchSetup',
    ];

    includePaths.forEach((includePath) => {
        const fullPath = path.join(folderPath, includePath);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // If it's a directory, include all files under it
            const items = fs.readdirSync(fullPath);
            items.forEach((item) => {
                if (item.endsWith('.js')) {
                    files.push(path.join(fullPath, item));
                }
            });
        } else if (stat.isFile()) {
            // If it's a file, include it directly
            files.push(fullPath);
        }
    });

    return files;
}

async function teamsCommandsFiles() {
    try {
        const folderPath = path.join(__dirname, '..', 'Commands');
        const jsFiles = getFiles(folderPath);

        // Delete cache for the specific files
        jsFiles.forEach(deleteCachedFile);

        return jsFiles;
    } catch (error) {
        console.log(`error loading files ${error}`);
        throw error;
    }
}

module.exports = { teamsCommandsFiles };

