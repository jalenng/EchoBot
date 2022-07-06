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
    },
    {
      name: 'language',
      type: 'STRING',
      description: 'Language to use. Default: en-US.',
      required: false,
      choices: [
        // Unfortunately, Discord choices are limited to a maximum of 25 items

        // { name: 'Afrikaans', value: 'af-ZA' },
        { name: 'Arabic', value: 'ar-XA' },
        { name: 'Bengali', value: 'bn-IN' },
        // { name: 'Bulgarian', value: 'bg-BG' },
        // { name: 'Catalan', value: 'ca-ES' },
        { name: 'Cantonese', value: 'yue-HK' },
        // { name: 'Czech', value: 'cs-CZ' },
        // { name: 'Danish', value: 'da-DK' },
        // { name: 'Dutch (Belgium)', value: 'nl-BE' },
        // { name: 'Dutch (Netherlands)', value: 'nl-NL' },
        { name: 'English (Australia)', value: 'en-AU' },
        { name: 'English (India)', value: 'en-IN' },
        { name: 'English (United Kingdom)', value: 'en-GB' },
        { name: 'English (United States)', value: 'en-US' },
        { name: 'Filipino', value: 'fil-PH' },
        // { name: 'Finnish', value: 'fi-FI' },
        { name: 'French (Canada)', value: 'fr-CA' },
        { name: 'French (France)', value: 'fr-FR' },
        { name: 'German', value: 'de-DE' },
        // { name: 'Greek', value: 'el-GR' },
        // { name: 'Gujarati', value: 'gu-IN' },
        { name: 'Hindi', value: 'hi-IN' },
        // { name: 'Hungarian', value: 'hu-HU' },
        // { name: 'Icelandic', value: 'is-IS' },
        { name: 'Indonesian', value: 'id-ID' },
        // { name: 'Italian', value: 'it-IT' },
        { name: 'Japanese', value: 'ja-JP' },
        // { name: 'Kannada', value: 'kn-IN' },
        { name: 'Korean', value: 'ko-KR' },
        // { name: 'Latvian', value: 'lv-LV' },
        // { name: 'Malay', value: 'ms-MY' },
        // { name: 'Malayalam', value: 'ml-IN' },
        { name: 'Mandarin (China)', value: 'cmn-CN' },
        { name: 'Mandarin (Taiwan)', value: 'cmn-TW' },
        // { name: 'Norwegian', value: 'nb-NO' },
        // { name: 'Polish', value: 'pl-PL' },
        { name: 'Portuguese (Brazil)', value: 'pl-PT' },
        // { name: 'Punjabi', value: 'pa-IN' },
        // { name: 'Romanian', value: 'ro-RO' },
        { name: 'Russian', value: 'ru-RU' },
        // { name: 'Serbian', value: 'sr-RS' },
        // { name: 'Slovak', value: 'sk-SK' },
        { name: 'Spanish (Spain)', value: 'es-ES' },
        { name: 'Spanish (United States)', value: 'es-US' },
        // { name: 'Swedish', value: 'sv-SE' },
        { name: 'Tamil', value: 'ta-IN' },
        // { name: 'Telugu', value: 'te-IN' },
        { name: 'Thai', value: 'th-TH' },
        { name: 'Turkish', value: 'tr-TR' },
        // { name: 'Ukrainian', value: 'uk-UA' },
        { name: 'Vietnamese', value: 'vi-VN' }
      ]
    }
  ],
  func: async (member, channel, args) => {

    // Save the setting
    const memberID = member.id
    const prevOptions = await store.getItem(memberID)

    const defaults = {
      language: 'en-US',
      gender: 'MALE',
      pitch: 0.0,
      speed: 1.0
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
      description: `Your voice is **${options.gender.toLowerCase()}** with a speed of **${options.speed}x** and a pitch of **${options.pitch}**. \nYou are speaking **${options.language}**.`
    })
  }
})
