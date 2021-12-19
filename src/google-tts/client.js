const tts = require('@google-cloud/text-to-speech');

module.exports.client = new tts.TextToSpeechClient();