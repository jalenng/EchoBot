const { registerCommand } = require('../../core/command-system')
const { synthesizeSpeech } = require('../google-tts')
const { drawRandom } = require('./quotes.js')
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

    // Get the voice channel and resource
    const voiceChannel = ensureVoiceChannel(member)
    const resource = await synthesizeSpeech(quote)

    // Create the track
    const track = new Track(
      member,
      voiceChannel,
      resource, {
        title: quote
      })

    // Enqueue the track
    await enqueue(track)

    return `**Added to queue -** ${quote}`
  }
})
