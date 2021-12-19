const { commands, commandsDesc } = require('./command-registry.js')
const { BotError } = require('../../bot/bot-error.js')

module.exports = async interaction => {
  // Deploy the commands to the guild
  interaction.guild.commands.set(commandsDesc)

  // Ensure the interaction is a command and from a guild
  if (!interaction.isCommand() || !interaction.guildId) { return }

  // Get keyword
  const keyword = interaction.commandName

  // Try to get the command
  const command = commands[keyword]
  if (command === null) { return }

  // Try to execute the function
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
    let response = await command.func(member, channel, args)

    if (!response || response.length <= 0) { response = '**Done!**' }	// General response

    // Show the response
    await interaction.followUp(`✅ ${response}`)
  }

  // Handle errors elegantly
  catch (err) {
    let errResponse = 'There was an error. Please try again later.' // General response

    // If the error is a bot error, use the specific response
    if (err instanceof BotError && err.message != null && err.message.length > 0) { errResponse	= err.message }

    // Show the response
    interaction.followUp(`❌ **Error -** ${errResponse}`)
      .catch(console.log)

    // Log this error if it is not a bot error
    if (!(err instanceof BotError)) { console.log(err) }
  }
}
