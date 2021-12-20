const { BotError } = require('../../bot/bot-error.js')

/**
 * Draw a random quote from a guild's quotes channel
 *
 * @param {Discord.Guild} guild
 * @returns {String}
 */
async function drawRandomQuote (guild) {
  // Get quotes channel
  const channel = guild.channels.cache.find(ch => ch.name === 'quotes')

  // Ignore if quotes channel DNE or is not text-based
  if (!channel || !channel.isText()) { throw new BotError('Create a #quotes channel to use this command.') }

  // Get quotes from channel
  const quotes = await channel.messages.fetch({ limit: 100 })

  // Ignore if quotes channel is empty
  if (quotes.size === 0) { throw new BotError('There are no quotes in #quotes.') }

  const quotesKey = quotes.randomKey(1)
  const quote = quotes.get(quotesKey[0]).content

  return quote
}

// Exports
module.exports.drawRandomQuote = drawRandomQuote
