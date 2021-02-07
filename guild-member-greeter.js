module.exports = {
    greetGuildMember: greetGuildMember
}

// Import files and modules
const greetingMessages = require("./greeting-messages.json");

/**
 * Sends a greeting message to a guild member
 * @param {Discord.guildMember} guildMember - The guild member to greet
 */
function greetGuildMember(guildMember) {
    try {
        const generalChannel = guildMember.guild.channels.cache.find(ch => ch.name === 'general');
        if (generalChannel) {
            const guildID = guildMember.guild.id;
            const serverGreetingMessages = greetingMessages[guildID];
            const mentionString = `<@${guildMember.user.id}>`;
            var greetingMessage = greetingMessages['default'];
            if (serverGreetingMessages && serverGreetingMessages.length != 0) {
                var greetingMessageIndex = Math.floor(Math.random() * serverGreetingMessages.length);
                greetingMessage = serverGreetingMessages[greetingMessageIndex];
            }
            generalChannel.send(greetingMessage.replace('<member>', mentionString));
        }
    }
    catch (err) {
        console.log(err);
    }
}