require('dotenv').config();

const { Client, Intents } = require('discord.js');
const { Logger } = require('./logger.js');

// Core
const activityUpdater = require('./activity-updater');
const commandSystem = require('./command-system');
const voiceSystem = require('./voice-system');

// Add-ons
require('./google-tts');
require('./youtube-playback');
require('./quoter');

const DISCORD_TOKEN = require(process.env.DISCORD_CREDENTIALS).token;

// Set up logger
const logger = new Logger(`logs/test.log`);

// Initialize our Discord client
global.client = new Client({
    presence: {
        status: 'online',
    },
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ]
});

client.on('ready', () => {
    logger.log(`Logged in as ${client.user.tag}!`);
    logger.log('Ready.');
    
    setInterval(activityUpdater.updateActivity, 10000);  
});

// Set up event listeners
client.on('guildMemberAdd', guildMember => {
    guildMemberGreeter.greetGuildMember(guildMember);
});
client.on('interactionCreate', commandSystem.interactionListener);
// client.on('messageCreate', commandSystem.messageListener);

// Log in to our Discord client
client.login(DISCORD_TOKEN);