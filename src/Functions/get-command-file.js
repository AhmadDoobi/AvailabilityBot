const path = require('node:path');
const fs = require('fs');

async function deleteCachedFile(file) {
    const filePath = path.resolve(file);
    if (require.cache[filePath]) {
        delete require.cache[filePath];
    }
}

async function loadCommandFile(commandCategory, commandName) {
    try {
        const commandFile = path.join(__dirname, '../', 'commands', commandCategory, `${commandName}.js`);
        if (fs.existsSync(commandFile)) {
            await deleteCachedFile(commandFile);
            return require(commandFile);
        } else {
            throw new Error(`Command file not found for category: ${commandCategory} and command: ${commandName}`);
        }
    } catch (error) {
        console.log(`error loading command file ${error}`);
        throw error;
    }
}
module.exports = { loadCommandFile };