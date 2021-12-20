const { MessageEmbed } = require('discord.js')
const { registerCommand } = require('../../core/command-system')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')
const { convertTags } = require('../../core/tag-converter')
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
    const message = await convertTags(args.message) // Convert IDs

    // Voice channel, resource, title, properties
    const voiceChannel = ensureVoiceChannel(member)
    const resource = await synthesizeSpeech(message)
    const title = '💬 Say'
    const properties = [
      { name: 'Content', value: message }
    ]

    // Create the track
    const track = new Track(voiceChannel, resource, title, member, properties)

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
