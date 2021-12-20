const { MessageEmbed } = require('discord.js')
const { registerCommand, deployCommands, commandsDesc } = require('./command-registry.js')

/**
 * Deploy
 */
registerCommand({
  keyword: 'deploy',
  description: 'Deploys the commands',
  func: async (member, channel, args) => {
    return await deployCommands(member.guild)
  }
})

/**
 * Help
 */
registerCommand({
  keyword: 'help',
  description: 'Sends a help message',
  func: async (member, channel, args) => {
    // Create embed fields for each command
    const fields = commandsDesc.map((command) => {
      const description = command.description
      return {
        name: `\`/${command.name}\``,
        value: description
      }
    })

    return new MessageEmbed({
      title: 'Help',
      color: '#6ba14d',
      // description: description,
      fields: fields
    })
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
