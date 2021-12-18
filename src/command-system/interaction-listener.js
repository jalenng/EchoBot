const { commands, commandsDesc } = require('./command-registry.js');
const BotError = require('../bot-error.js');

module.exports = async interaction => {
	// Deploy the commands to the guild
	interaction.guild.commands.set(commandsDesc);

	// Ensure the interaction is a command and from a guild
	if (!interaction.isCommand() || !interaction.guildId)
		return;

	// Get keyword
	let keyword = interaction.commandName;

	// Try to get the command
	let command = commands[keyword];

	if (command == null)
		return;

	// Try to execute the function
	try {
		await interaction.deferReply();

		let member = interaction.member;
		let channel = interaction.channel;
		let options = interaction.options.data;

		let args = {}
		for (let option of options) {
			args[option.name] = option.value;
		}

		let response = await command.func(member, channel, args);

		await interaction.followUp(response);
	}

	// Handle errors elegantly
	catch (err) {
        if (err instanceof BotError) {
			interaction.followUp(err.message).err(()=>{});
        }
        else {
			interaction.followUp("Generic error.").err(()=>{});
        }
	}
}