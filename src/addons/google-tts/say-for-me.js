const { convertTags } = require('../../core/tag-converter')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')

const { synthesizeSpeech } = require('./speaker.js')
const { store } = require('./store.js')

const sayForMeListener = async (message) => {
  // Ensure message was sent from text channel called 'say-for-me'
  if (message.channel.name !== 'say-for-me') { return }

  // Ensure message was not sent by a bot
  if (message.author.bot) { return }

  try {
    const member = message.member
    const messageContent = await convertTags(message.content) // Convert IDs

    // Voice channel, resource, title, properties
    const voiceChannel = ensureVoiceChannel(member)
    const options = await store.getItem(member.id)
    const resource = await synthesizeSpeech(messageContent, options)
    const title = '💬 Say'
    const properties = [
      { name: 'Content', value: messageContent }
    ]

    // Create the track
    const track = new Track(voiceChannel, resource, title, member, properties)

    // Enqueue the track
    await enqueue(track)
  } catch (err) {

  }
}

module.exports.sayForMeListener = sayForMeListener
