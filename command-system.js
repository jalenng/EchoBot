module.exports = {
    commandHandler: commandHandler
}

// Import files and modules
var voiceFunctions = require('./voice-functions');

// Help embed
const helpEmbed = new Discord.MessageEmbed()
    .setTitle('Bot Commands')
    .setDescription('')
    .setColor(0xff0000)
    .addFields(
        { 
            name: '`-help`\n`-?`', 
            value: 'Sends a DM to caller with information about this bot\'s commands.' 
        },
        { 
            name: '`-say [m/f] <text>`\n`-s [m/f] <text>`', 
            value: 'Speaks text in the voice channel the caller is in.'
        },
        { 
            name: '`-sayquote [m/f]`\n`-sq [m/f]`', 
            value: 'Selects a random quote from the 100 most recent messages in **#quotes**, then speaks it in the voice channel the caller is in.' 
        },
        {
            name: '`-sbday <name>`', 
            value: 'Sings "Happy Birthday" in the voice channel the caller is in.' 
        }
    )
    .setFooter('Bot by Jaygantic#2171', 'https://avatars2.githubusercontent.com/u/42555186?s=460&v=4');

/**
 * Splits a string by its first space.
 * @param {string} input - The input string to split
 * @return {Array} - An array of two elements
 */
function splitNextSpace(input) {
    var indexOfNextSpace = input.indexOf(' ');
    
    // For one word commands
    if (indexOfNextSpace == -1) indexOfNextSpace = input.length;

    const result = [
        input.substring(0, indexOfNextSpace),
        input.substring(indexOfNextSpace + 1, input.length)
    ];

    return result
}

/**
 * Sends a sequence of reactions to a message.
 * @param {Discord.message} message - The Discord message to react to
 * @param {string[]} emojis - The array of emojis/Twemojis to react with. A space is used to clear all reactions.
 */
async function reactSequence(message, emojis) {
    for (emoji of emojis) {
        if (emoji == " ")
            await message.reactions.removeAll().catch(err => {});
        else
            await message.react(emoji).catch(err => {});
    }
}

/**
 * Handles a bot command from a message
 * @param {Discord.message} message - The Discord message that invoked the command
 */
async function commandHandler(message) {
    const messageContent = message.content;
    const trimmedContent = messageContent.substring(1, messageContent.length);  // Removes the command prefix
    const command = splitNextSpace(trimmedContent); // command[0]: command; command[1]: arguments

    try {
        var reactionStatus;
        
        switch (command[0]) {

            // Sends a DM to caller with information about this bot's commands.
            // Syntax: /help or /?
            case 'help': 
            case '?':
                // React to indicate status
                message.react('💭');

                // Call async functions
                var DMChannel = await message.author.createDM();
                await DMChannel.send(helpEmbed);
                await message.reply(replyMessages['checkDMs']);

                // React to indicate success
                message.reactions.removeAll().catch(err => {});
                message.react('✅');

                break;
    
            // Randomly draw a quote from the most recent 100 messages in #quotes, then speaks it in voice channel the caller is in.
            // Syntax: /sayquote or /sq
            case 'sayquote': 
            case 'sq':
                // Check for gender arguments
                var gender = 'NEUTRAL';
                var textToSay = command[1];
    
                // If textToSay begins with m or f, pull it out.
                var splitContent = splitNextSpace(command[1]);
                if (splitContent[0] == 'm') {
                    gender = 'MALE';
                }
                else if (splitContent[0] == 'f') {
                    gender = 'FEMALE';
                }

                // Get quotes channel
                var quotesChannel = message.guild.channels.cache.find(ch => ch.name === 'quotes');
    
                // Ignore if quotes channel DNE or is not text-based
                if (!quotesChannel || !quotesChannel.isText())
                    throw new BotError(replyMessages['noQuotes']);
    
                // Get quotes from channel
                var quotes = await quotesChannel.messages.fetch({limit: 100});
    
                // Ignore if quotes channel is empty
                if (quotes.size == 0)
                    throw new BotError(replyMessages['noQuotes']);

                var quotesKey = quotes.randomKey(1);
                textToSay = quotes.get(quotesKey[0]).content;
    
                // React to indicate status
                await message.react('🔊');
                
                await voiceFunctions.sayInVC(textToSay, gender, message)
                    .catch(err => {throw err;});

                // React to indicate success
                message.reactions.removeAll().catch(err => {});
                message.react('✅');

                break;
    
            // Speaks text in the voice channel the caller is in.
            // Syntax: /say [m/f] <text> or /s [m/f] <text>
            case 'say':
            case 's':
                // Check for gender arguments
                var gender = 'NEUTRAL';
                var textToSay = command[1];

                // If textToSay begins with m or f, pull it out.
                var splitContent = splitNextSpace(command[1]);
                if (splitContent[0] == 'm') {
                    gender = 'MALE';
                    textToSay = splitContent[1];
                }
                else if (splitContent[0] == 'f') {
                    gender = 'FEMALE';
                    textToSay = splitContent[1];
                }

                // Check if there is text to say
                if (textToSay == '') 
                    throw new BotError(replyMessages['nothingToSay']);

                // React to indicate status
                message.react('🔊');

                // Call async function
                await voiceFunctions.sayInVC(textToSay, gender, message)
                    .catch(err => {throw err;});

                // React to indicate success
                message.reactions.removeAll().catch(err => {});
                message.react('✅');

                break;            
    
            // Sings "Happy Birthday" in the voice channel the caller is in.
            // Syntax: /sbday <name>
            case 'sbday':
                var gender = 'NEUTRAL';
                var name = command[1];

                // Check if there is text to say
                if (name == "") throw new BotError(replyMessages['nothingToSay']);

                // React to indicate status
                message.react('🎵');

                // Queue reaction sequence
                reactSequence(message, ["🇭", "🇦", "🇵", "🅿", "🇾", " ", "🇧", "🇮", "🇷", "🇹", "🇭", "🇩", "🇦", "🇾", " ", "🇹", "🇴", " ", "🇾", "🇴", "🇺", " "]);           

                // Call async functions
                await voiceFunctions.playFileInVC('audio/birthday_1.mp3', message); 
                await voiceFunctions.sayInVC(name, gender, message); 
                await voiceFunctions.playFileInVC('audio/birthday_2.mp3', message); 
                
                // React to indicate success
                message.reactions.removeAll().catch(err => {});
                message.react('✅');

                break;

        }

    }
    catch (err) {
        // Handle exceptions
        if (err instanceof BotError) {
            message.reply(err.message);
        }
        else {
            message.reply(replyMessages['generalError']);
            console.log(err);
        }
        // React to indicate failure
        await message.reactions.removeAll().catch(err => {});
        message.react('❌');
    }  
}