const { botClient } = require('../../bot')

const { sendIntroduction } = require('./greeter.js')

// Set up event listeners
botClient.on('guildCreate', sendIntroduction)
