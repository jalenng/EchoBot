const { MessageEmbed } = require('discord.js')
const { log } = require('../logger')

// Introduction embed
const introEmbed = new MessageEmbed({
  title: 'Hi!',
  color: '#39a4fd',
  description: `Thanks for inviting me to this server!
  Type \`/help\` to see what I can do.`
})

/**
 * Sends an introduction message to a guild
 *
 * @param {Discord.Guild} guild - The guild to send the introduction message to
 */
async function sendIntroduction (guild) {
  // Get the general channel
  const channel = guild.channels.cache.find(ch => ch.name === 'general')

  // Ignore if general channel DNE or is not text-based
  if (!channel || !channel.isText()) { return }

  // Send the introduction message
  try {
    await channel.send({ embeds: [introEmbed] })
    log(`Sent introduction to guild ${guild.id} (${guild.name})`)
  } catch (error) {
    log(`Failed to send introduction to guild ${guild.id} (${guild.name})\n${error}\n${error.stack}`)
  }
}

// Exports
module.exports.sendIntroduction = sendIntroduction
