const { MessageEmbed } = require('discord.js')
const { registerCommand } = require('../../core/command-system')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')
const { convertTags } = require('../../core/tag-prettify')
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

    // Voice channel, resource, properties
    const title = '💬 Say'
    const description = `Content: ${message}`

    const voiceChannel = ensureVoiceChannel(member)
    const resource = await synthesizeSpeech(await convertTags(message))
    const properties = {
      title: title,
      description: description,
      member: member
    }

    // Create the track
    const track = new Track(
      voiceChannel,
      resource,
      properties
    )

    // Enqueue the track
    await enqueue(track)

    // Return the embed
    return new MessageEmbed({
      title: 'Added to queue',
      color: '#6ba14d',
      fields: [
        {
          name: title,
          value: description
        }
      ]
    })
  }
})
