const { MessageEmbed } = require('discord.js')
const { registerCommand } = require('../../core/command-system')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')

const {
  streamYouTubeAudio,
  getYouTubeMetadata,
  getURLFromArg
} = require('./downloader')

/**
 * YouTube playback
 */
registerCommand({
  keyword: 'yt',
  description: 'Plays audio from a YouTube video',
  options: [
    {
      name: 'arg',
      type: 'STRING',
      description: 'The URL or search query to use',
      required: true
    }
  ],
  func: async (member, channel, args) => {
    // Voice channel, resource, properties
    const voiceChannel = ensureVoiceChannel(member)

    // Validate or get the URL from a search query
    const url = await getURLFromArg(args.arg)

    // Get video metadata
    const metadata = await getYouTubeMetadata(url)
    const title = `▶️ ${metadata.player_response.videoDetails.title}`

    // Get length
    let length = metadata.player_response.videoDetails.lengthSeconds
    length = Math.floor(length / 60) + ':' + (length % 60 < 10 ? '0' : '') + length % 60

    // Properties
    const properties = [
      { name: 'Channel', value: metadata.player_response.videoDetails.author },
      { name: 'Length', value: length },
      { name: 'URL', value: url }
    ]

    // Create the resource
    const resource = await streamYouTubeAudio(url)
    if (!resource) return

    // Create the track
    const track = new Track(
      voiceChannel,
      resource,
      title,
      member,
      properties
    )

    // Enqueue the track
    await enqueue(track)

    // Return the embed
    return new MessageEmbed({
      title: 'Added to queue',
      color: '#6ba14d',
      fields: [track.getEmbedField()]
    })
  }
})
