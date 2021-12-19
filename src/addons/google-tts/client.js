const tts = require('@google-cloud/text-to-speech')

const ttsClient = new tts.TextToSpeechClient()

// Exports
module.exports.ttsClient = ttsClient
