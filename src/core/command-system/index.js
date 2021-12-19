const { botClient } = require('../../bot')
const { BotError } = require('../../bot/bot-error.js')

module.exports.registerCommand = require('./command-registry.js').registerCommand

// Register the commands
require('./commands.js')

// Set up event listeners
botClient.on('interactionCreate', require('./interaction-listener.js'))
