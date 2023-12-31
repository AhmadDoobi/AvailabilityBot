const fs = require('node:fs');
const path = require('node:path');

async function deleteCachedFile(file) {
    const filePath = path.resolve(file);
    if (require.cache[filePath]) {
        delete require.cache[filePath];
    }
}

function getFiles(folderPath) {
    let files = [];
    const items = fs.readdirSync(folderPath);
    
    for (const item of items) {
        if (item === '.DS_Store') {
            continue;
        }
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            files = files.concat(getFiles(itemPath));
        } else if (stat.isFile() && item.endsWith('.js')) {
            files.push(itemPath);
        }
    }
    
    return files;
}

async function loadFiles(folder) {
    try {
        const folderPath = path.join(__dirname, '..', folder);
        const jsFiles = getFiles(folderPath);
        await Promise.all(jsFiles.map(deleteCachedFile));
        return jsFiles;
    } catch (error) {
        console.log(`error loading files ${error}`);
        throw error;
    }
}

module.exports = { loadFiles };
