const { commandsDesc, commandToFuncMap } = require('./command-registry.js');

/**
 * Takes a message, parses it, and executes the command if it is valid
 * 
 * @param {*} message 
 * @returns 
 */
module.exports = async message => {
    // Deploy the commands to the guild
    message.guild.commands.set(commandsDesc);

    let content = message.content;

    // Attempt to match prefix
    let prefix = '/';
    if (!content.startsWith(prefix))
        return;

    // Get keyword and args
    let splitCommand = content.substring(prefix.length).split(' ');
    let keyword = splitCommand[0].toLowerCase();
    let args = splitCommand.slice(1);

    // Try to get the function
    let commandFunction = commandToFuncMap.get(keyword);
    if (commandFunction == null)
        return;

    // Try to execute the function
    let success = true;
    try {
        message.react('💭');
        let response = await commandFunction(message, args);
        if (response)
            return response;
    }
    catch (err) {
        success = false;
        if (err instanceof BotError) {
            console.log(err);
        }
        else {
            console.log(err);
        }
    }

    // React to indicate success or failure
    await message.reactions.removeAll().catch(err => {});
    if (success)
        message.react('✅');
    else
        message.react('❌');
};