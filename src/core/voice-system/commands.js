const { registerCommand } = require('../command-system')
const { getQueue, enqueue, next } = require('./subscription-manager')

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
    return await getQueue(member.guild)
  }
})
