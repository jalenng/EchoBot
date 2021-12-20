const { MessageEmbed } = require('discord.js')
const { registerCommand } = require('../command-system')
const { getQueue, next } = require('./subscription-manager')

/**
 * Next
 */
registerCommand({
  keyword: 'next',
  description: 'Skips the current track',
  func: async (member, channel, args) => {
    return await next(member.guild)
  }
})

/**
 * Queue
 */
registerCommand({
  keyword: 'queue',
  description: 'Shows the voice queue of the guild',
  func: async (member, channel, args) => {
    const queue = await getQueue(member.guild)

    // Get the embed fields for each track
    const fields = queue.map((track, index) => {
      const field = track.getEmbedField()

      // Add the track's index in the queue to the field title
      field.name = `[${index + 1}]\n${field.name}`
      return field
    })

    const description = queue.length === 0 ? 'The queue is empty.' : ''

    return new MessageEmbed({
      title: 'Queue',
      color: '#6ba14d',
      description: description,
      fields: fields
    })
  }
})
