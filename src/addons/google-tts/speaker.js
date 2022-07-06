const { Readable } = require('stream')
const {
  createAudioResource,
  StreamType
} = require('@discordjs/voice')

const { ttsClient } = require('./client.js')

/**
 * Synthizes speech from a message and returns an audio resource
 *
 * @param {string} message The message to synthesize
 * @param {Object} voiceOptions Voice options
 * @returns {Discord.AudioResource}
 */
async function synthesizeSpeech (message, voiceOptions) {
  const options = {
    // Defaults
    gender: 'MALE',
    pitch: 0.0,
    speakingRate: 1.0,

    // Overrides
    ...voiceOptions
  }

  // Set up the request
  const request = {
    input: {
      text: message
    },
    voice: {
      languageCode: 'en-US',
      ssmlGender: options.gender
    },
    audioConfig: {
      audioEncoding: 'MP3',
      pitch: options.pitch,
      speakingRate: options.speed
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
