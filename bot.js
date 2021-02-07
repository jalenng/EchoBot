// Import files and modules
require('dotenv').config();

global.Discord = require('discord.js');
global.BotError = require('./bot-error.js').botError;
global.replyMessages = require("./reply-messages.json");

const guildMemberGreeter = require('./guild-member-greeter.js');
const commandSystem = require('./command-system.js');
const activityUpdater = require('./activity-updater.js')

// Other constants
const COMMAND_PREFIX = '/';
const UPDATE_ACTIVITY_INTERVAL = 60000;

// Initialize our Discord client
global.discordClient = new Discord.Client({
    presence: {
        status: 'online',
    }
});

// Log to console and start interval to update activity when ready
discordClient.on('ready', function() {
    console.log('Ready for action.');

    var user = discordClient.user;
    var type = user.bot ? 'BOT' : 'USER'
    console.log('Tag: %s (%s) \n', user.tag, type);

    setInterval(activityUpdater.updateActivity, UPDATE_ACTIVITY_INTERVAL);      
});

// Greetings system: greets new guild members
discordClient.on('guildMemberAdd', guildMember => {
    guildMemberGreeter.greetGuildMember(guildMember);
});

// Message Handler: handles commands
discordClient.on('message', async message => {
    // Handle DM's
    if (!message.guild) {
        if (message.author != discordClient.user)
            message.reply(replyMessages['rejectedDM']);
        return;
    }
    // Check if message is command. If so, handle the command.
    if (message.content.indexOf(COMMAND_PREFIX) == 0) 
        commandSystem.commandHandler(message);
});

// Log in to our Discord client
discordClient.login(require(process.env.DISCORD_CREDENTIALS).token);