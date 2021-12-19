const { registerCommand } = require('../../core/command-system')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')
const { synthesizeSpeech } = require('./speaker.js')

/**
 * Say
 */
registerCommand({
  keyword: 'say',
  description: 'Speaks a message in a voice channel',
  options: [
    {
      name: 'message',
      type: 'STRING',
      description: 'The message to speak',
      required: true
    }
  ],
  func: async (member, channel, args) => {
    const message = args.message

    // Get the voice channel
    const voiceChannel = ensureVoiceChannel(member)

    // Create a track
    const resource = await synthesizeSpeech(message)
    const track = new Track(
      member,
      voiceChannel,
      resource,
      {
        title: message
      }
    )

    // Enqueue the track
    await enqueue(track)

    return `**Added to queue -** ${message}`
  }
})
