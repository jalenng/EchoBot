const { MessageEmbed } = require('discord.js')
const { registerCommand } = require('../../core/command-system')
const { synthesizeSpeech } = require('../google-tts')
const { drawRandom } = require('./quotes.js')
const { convertTags } = require('../../core/tag-prettify')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')

/**
 * Say quote
 */
registerCommand({
  keyword: 'quote',
  description: 'Draws a quote from #quotes and speaks it in a voice channel',
  func: async (member, channel, args) => {
    // Retrieve the quote
    const quote = await drawRandom(member.guild)

    // Voice channel, resource, properties
    const title = '💬 Quote'
    const description = `Content: ${quote}`

    const voiceChannel = ensureVoiceChannel(member)
    const resource = await synthesizeSpeech(await convertTags(quote))
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
