const { botClient } = require('../../bot')

const { registerCommand, deployCommands } = require('./command-registry.js')
const { interactionListener } = require('./interaction-listener.js')

// Register the commands
require('./commands.js')

// Set up event listeners
botClient.on('interactionCreate', interactionListener)
botClient.on('guildCreate', deployCommands)
botClient.on('messageCreate', (message) => { deployCommands(message.guild).catch() })

// Exports
module.exports.registerCommand = registerCommand
