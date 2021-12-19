const { synthesizeSpeech } = require('./speaker.js')

// Register the commands
require('./commands.js')

// Exports
module.exports.synthesizeSpeech = synthesizeSpeech
