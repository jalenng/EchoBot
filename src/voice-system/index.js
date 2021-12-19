const { enqueue, getQueue, ensureVoiceChannel } = require("./subscription-manager.js");

const VC_TIMEOUT_DURATION = 60000;

module.exports.Track = require('./track.js');
module.exports.enqueue = enqueue;
module.exports.getQueue = getQueue;
module.exports.ensureVoiceChannel = ensureVoiceChannel;

// Register commands
require("./commands.js");