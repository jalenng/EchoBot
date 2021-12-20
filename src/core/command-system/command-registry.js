// Map wsed for parsing and executing commands
const commands = new Map()

// Array used for deploying commands and the help command
const commandsDesc = []

/**
 * Registers a command into the command system
 *
 * @param {String[]} keywords The keywords to bind
 * @param {*} func The function to bind
 */
function registerCommand (cmdProps) {
  const keyword = cmdProps.keyword

  // Add to the commands map
  commands[keyword] = {
    name: keyword,
    func: cmdProps.func,
    description: cmdProps.description ? cmdProps.description : cmdProps.keyword,
    options: cmdProps.options ? cmdProps.options : []
  }

  // Add to the commands description array
  commandsDesc.push({
    name: keyword,
    description: cmdProps.description ? cmdProps.description : cmdProps.keyword,
    options: cmdProps.options ? cmdProps.options : []
  })
};

/**
 * Deploys the commands to a guild
 *
 * @param {Discord.Guild} guild - The guild to deploy the commands to
 */
function deployCommands (guild) {
  guild.commands.set(commandsDesc)
}

module.exports.commands = commands
module.exports.registerCommand = registerCommand
module.exports.deployCommands = deployCommands
