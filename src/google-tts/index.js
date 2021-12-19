const { synthesizeSpeech } = require('./speaker.js');

// Register commands
require("./commands.js");

module.exports.synthesizeSpeech = synthesizeSpeech;