const { streamYouTubeAudio } = require('./downloader')

// Register the commands
require('./commands.js')

// Exports
module.exports.streamYouTubeAudio = streamYouTubeAudio
