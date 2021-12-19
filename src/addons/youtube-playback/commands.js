const { registerCommand } = require('../../core/command-system')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')

const { streamYouTubeAudio } = require('./downloader')

/**
 * YouTube playback
 */
registerCommand({
  keyword: 'yt',
  description: 'Plays audio from a YouTube video',
  options: [
    {
      name: 'url',
      type: 'STRING',
      description: 'The URL of the resource to play',
      required: true
    }
  ],
  func: async (member, channel, args) => {
    // Get the voice channel
    const voiceChannel = ensureVoiceChannel(member)

    // Create a track
    const message = args.message
    const resource = await streamYouTubeAudio(args.url)
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

    return `**Added to queue -** ${args.url}`
  }
})
