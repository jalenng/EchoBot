const { MessageEmbed } = require('discord.js')
const { registerCommand } = require('../../core/command-system')
const { synthesizeSpeech } = require('../google-tts')
const { drawRandomQuote } = require('./quote-drawer.js')
const { convertTags } = require('../../core/tag-converter')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')

/**
 * Say quote
 */
registerCommand({
  keyword: 'quote',
  description: 'Draws a quote from #quotes and speaks it in a voice channel',
  func: async (member, channel, args) => {
    // Retrieve the quote
    const quote = await convertTags(await drawRandomQuote(member.guild))

    // Voice channel, resource, title, properties
    const voiceChannel = ensureVoiceChannel(member)
    const resource = await synthesizeSpeech(quote)
    const title = '💬 Quote'
    const properties = [
      { name: 'Content', value: quote }
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
