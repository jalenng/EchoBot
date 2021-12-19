const { BotError } = require('../../bot/bot-error.js')
const { registerCommand } = require('./command-registry.js')

/**
 * Help
 */
registerCommand({
  keyword: 'help',
  description: 'Sends a help message',
  func: async (member, channel, args) => {
    throw new BotError('This feature has not been implemented yet.')
  }
})

/**
 * Repeat
 */
registerCommand({
  keyword: 'repeat',
  description: 'Repeats a message',
  options: [
    {
      name: 'message',
      type: 'STRING',
      description: 'The message to repeat',
      required: true
    }
  ],
  func: async (member, channel, args) => {
    const text = args.message
    return text
  }
})
