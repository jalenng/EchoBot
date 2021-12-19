const { Readable } = require('stream')
const { 
    createAudioResource,
    StreamType
} = require('@discordjs/voice')

const BotError = require('../bot-error.js');
const { client } = require('./client.js')

/**
 * Synthizes speech from a message and returns an audio resource
 * 
 * @param {String} message The message to synthesize
 * @param {*} voiceOptions Voice options
 * @returns 
 */
module.exports.synthesizeSpeech = async (message, voiceOptions) => {
    // Set up the request
    let request = {
        input: {
            text: message
        },
        voice: {
            languageCode: 'en-US', 
            ssmlGender: 'm', 
            // ...voiceOptions
        },
        audioConfig: {
            audioEncoding: 'MP3', 
            speakingRate: 1.0
        }
    };

    // Send the request
    let [response] = await client.synthesizeSpeech(request);

    // Make a stream from the response
    let stream = Readable.from([response.audioContent])

    // Return an audio resource from the stream
    return createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
    });
}