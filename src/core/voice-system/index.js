const { Track } = require('./track.js')
const { enqueue, getQueue, ensureVoiceChannel } = require('./subscription-manager.js')

const VC_TIMEOUT_DURATION = 60000

// Register the commands
require('./commands.js')

module.exports.Track = Track
module.exports.enqueue = enqueue
module.exports.getQueue = getQueue
module.exports.ensureVoiceChannel = ensureVoiceChannel
