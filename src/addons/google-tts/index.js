// temp
const { botClient } = require('../../bot')

const { synthesizeSpeech } = require('./speaker.js')
const { sayForMeListener } = require('./say-for-me.js')
const { store } = require('./store.js')

// Register the commands
require('./commands.js')

// Initialize the store
store.init()

// Register the listener for 'say-for-me' channels
botClient.on('messageCreate', sayForMeListener)

// Exports
module.exports.synthesizeSpeech = synthesizeSpeech
