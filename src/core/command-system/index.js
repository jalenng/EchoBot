const { botClient } = require('../../bot')

const {
  registerCommand,
  deployCommands
} = require('./command-registry.js')
const { interactionListener } = require('./interaction-listener.js')

// Register the commands
require('./commands.js')

// Set up event listeners
botClient.on('interactionCreate', interactionListener)
botClient.on('guildCreate', async (guild) => {
  try {
    await deployCommands(guild)
  } catch (error) {
    // TODO: Handle error
  }
})

// Exports
module.exports.registerCommand = registerCommand
