const { Client, Intents } = require('discord.js')
const { Logger } = require('../logger.js')

const DISCORD_TOKEN = require(process.env.DISCORD_CREDENTIALS).token

// Set up logger
const logger = new Logger('logs/test.log')

// Initialize our Discord client
const botClient = new Client({
  presence: {
    status: 'online'
  },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ]
})

// Log to console when ready
botClient.on('ready', () => {
  logger.log(`Logged in as ${botClient.user.tag}!`)
  logger.log('Ready.')
})

// Log in to our Discord client
botClient.login(DISCORD_TOKEN)

// Exports
module.exports.botClient = botClient
