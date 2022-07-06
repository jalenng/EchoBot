const { MessageEmbed } = require('discord.js')

const { registerCommand } = require('../../core/command-system')
const { Track, enqueue, ensureVoiceChannel } = require('../../core/voice-system')
const { convertTags } = require('../../core/tag-converter')
const { synthesizeSpeech } = require('./speaker.js')
const { store } = require('./store.js')

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
    const options = await store.getItem(member.id)
    const resource = await synthesizeSpeech(message, options)
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

/**
 * Set voice
 */
registerCommand({
  keyword: 'setvoice',
  description: 'Configures voice options',
  options: [
    {
      name: 'gender',
      type: 'STRING',
      description: 'Must be male or female.',
      required: false,
      choices: [
        { name: 'male', value: 'MALE' },
        { name: 'female', value: 'FEMALE' }
      ]
    },
    {
      name: 'speed',
      type: 'NUMBER',
      description: 'Must be a number between 0.25 and 4.00. Default: 1.00.',
      required: false,
      minValue: 0.25,
      maxValue: 4.00
    },
    {
      name: 'pitch',
      type: 'NUMBER',
      description: 'Must be a number between -20.00 and 20.00. Default: 0.00.',
      required: false,
      minValue: -20.00,
      maxValue: 20.00
    }
  ],
  func: async (member, channel, args) => {
    // Validate the options
    if (args.speed) {
      if (args.speed < 0.25 || args.speed > 4.00) {
        return new MessageEmbed({
          title: 'Invalid speed',
          color: '#ff0000',
          description: 'Speed must be between 0.25 and 4.00'
        })
      }
    }

    // Save the setting
    const memberID = member.id
    const prevOptions = await store.getItem(memberID)

    const defaults = {
      gender: 'MALE',
      pitch: 0.0,
      speakingRate: 1.0
    }

    const options = {
      ...defaults,
      ...prevOptions,
      ...args
    }
    await store.setItem(memberID, options)

    // Return the embed
    return new MessageEmbed({
      title: 'Voice updated',
      color: '#6ba14d',
      description: `Your voice is **${options.gender.toLowerCase()}** with a speed of **${options.speed}x** and a pitch of **${options.pitch}**`
    })
  }
})
