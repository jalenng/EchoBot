const BotError = require('../bot-error');

module.exports.messageListener = require('./message-listener.js')
module.exports.interactionListener = require('./interaction-listener.js')
module.exports.registerCommand = require('./command-registry.js').registerCommand;

// Import the commands
require('./commands.js');