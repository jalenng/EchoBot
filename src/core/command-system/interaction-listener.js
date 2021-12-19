const { MessageEmbed } = require('discord.js')
const { commands, deployCommands } = require('./command-registry.js')
const { BotError } = require('../../bot/bot-error.js')

async function interactionListener (interaction) {
  deployCommands(interaction.guild)

  // Ensure the interaction is a command and from a guild
  if (!interaction.isCommand() || !interaction.guildId) { return }

  // Get keyword
  const keyword = interaction.commandName

  // Try to get the command
  const command = commands[keyword]
  if (command === null) { return }

  // Try to execute the function
  let response = null
  try {
    await interaction.deferReply()

    const member = interaction.member
    const channel = interaction.channel
    const options = interaction.options.data

    const args = {}
    for (const option of options) {
      args[option.name] = option.value
    }

    // Execute the command and wait for a response
    response = await command.func(member, channel, args)

    // General response
    if (!response) {
      response = new MessageEmbed({
        title: 'Done!',
        color: '#6ba14d'
      })
    }
  } catch (error) {
    let errorDescription = 'Please try again later.' // General response

    // If the error is a bot error, use the specific response
    const canUseErrResponse = error instanceof BotError && error.message != null && error.message.length > 0
    if (canUseErrResponse) { errorDescription = error.message }

    response = new MessageEmbed({
      title: 'Error',
      color: '#DA2D43',
      description: errorDescription
    })
  }

  // Follow up
  await followUp(interaction, response)
}

async function followUp (interaction, response) {
  try {
    if (typeof response === 'string') {
      await interaction.followUp(response)
    } else if (response instanceof MessageEmbed) {
      await interaction.followUp({ embeds: [response] })
    }
  } catch (err) { // If there was a problem following up, log it
    console.log(err)
  }
}

module.exports.interactionListener = interactionListener
