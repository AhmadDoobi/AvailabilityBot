const { reactionAddHandler } = require('../../Handlers/reaction-add')
module.exports = {
    name: "messageReactionAdd",
    execute: async (reaction, user) => {
        await reactionAddHandler(reaction, user);
    }
}
