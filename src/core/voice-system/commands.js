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
    console.log(queue)

    const fields = queue.map((track, index) => {
      const props = track.props
      return {
        name: `[${index + 1}] \n${props.title}`,
        value: `*${props.description} \nAdded by ${props.member.displayName}*`
      }
    })

    console.log(fields)

    return new MessageEmbed({
      title: 'Queue',
      color: '#6ba14d',
      fields: fields
    })
  }
})
