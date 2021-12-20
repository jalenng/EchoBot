const { MessageEmbed } = require('discord.js')
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
    // Voice channel, resource, properties
    const voiceChannel = ensureVoiceChannel(member)
    const resource = await streamYouTubeAudio(args.url)
    if (!resource) return

    const title = `▶️ ${args.url}`
    const properties = [
      { name: 'Channel', value: args.url },
      { name: 'URL', value: args.url }
    ]

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
