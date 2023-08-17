const { reactionRemoveHandler } = require('../../Handlers/reaction-remove');

module.exports = {
    name: "messageReactionRemove",
    execute: async (reaction, user) => {
        await reactionRemoveHandler(reaction, user);
    }
}
