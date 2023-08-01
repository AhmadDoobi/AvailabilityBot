const { loadFiles } = require('../Functions/files-loader');


async function loadEvents(client) {
    console.time("Events Loaded");

    client.events = new Map();
    const ascii = require("ascii-table");
    const table = new ascii().setHeading("Events", "Status");

    const files = await loadFiles('Events');
    for (const file of files) {
        try {
            const event = require(file);
            const execute = (...args) => event.execute(...args, client);
            const target = event.rest ? client.rest : client;

            target[event.once ? "once" : "on"](event.name, execute);
            client.events.set(event.name, execute);
            table.addRow(event.name, "✅" );
        } catch (error) {
            table.addRow(event.name,  "🔴");
        }
    }

    return console.log(table.toString(), "\nEvents Loaded")
}

module.exports = { loadEvents }