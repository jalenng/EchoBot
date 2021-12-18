// Import the commands
require("./commands.js");

const VC_TIMEOUT_DURATION = 60000;
const VOICE_TEMP_FILE_PATH = 'temp/voice';

var vcDisconnectTimer;

/**
 * Checks if the bot is busy talking in a voice channel
 * @param {Discord.message} message - The Discord message that invoked the command
 * @return {boolean} - True if bot is busy; false otherwise
 */
async function checkIfBotIsTalking(message) {
    if (!message.guild.voice || !message.guild.voice.channel) return false;
    const botVoiceState = message.guild.voice;
    const botVCConnection = await botVoiceState.channel.join();
    return botVCConnection && botVCConnection.dispatcher;
}


// Register commands
require("./commands.js");