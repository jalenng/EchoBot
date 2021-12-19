const { Readable } = require('stream')
const {
  createAudioResource,
  StreamType
} = require('@discordjs/voice')

const { BotError } = require('../../bot/bot-error.js')
const { ttsClient } = require('./client.js')

/**
 * Synthizes speech from a message and returns an audio resource
 *
 * @param {String} message The message to synthesize
 * @param {*} voiceOptions Voice options
 * @returns
 */
async function synthesizeSpeech (message, voiceOptions) {
  // Set up the request
  const request = {
    input: {
      text: message
    },
    voice: {
      languageCode: 'en-US',
      ssmlGender: 'm'
      // ...voiceOptions
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0
    }
  }

  // Send the request
  const [response] = await ttsClient.synthesizeSpeech(request)

  // Make a stream from the response
  const stream = Readable.from([response.audioContent])

  // Return an audio resource from the stream
  return createAudioResource(stream, {
    inputType: StreamType.Arbitrary
  })
}

// Exports
module.exports.synthesizeSpeech = synthesizeSpeech
