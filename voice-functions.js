module.exports = {
    checkIfBotIsTalking: checkIfBotIsTalking,
    sayInVC: sayInVC,
    playFileInVC: playFileInVC
}

// Import files and modules
const fs = require('fs');
const util = require('util');
const TTS = require('@google-cloud/text-to-speech');

const VC_TIMEOUT_DURATION = 60000;
const VOICE_TEMP_FILE_PATH = 'temp/voice';
const DISCORD_USER_TAG_REGEX = /<@![0-9]+>/g;
const DISCORD_CHANNEL_TAG_REGEX = /<#[0-9]+>/g;

var vcDisconnectTimer;

// TTS Client
const ttsClient = new TTS.TextToSpeechClient();

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

/**
 * Speaks a message in the voice channel of the invoker
 * @param {string} textToSay - The text for the bot to say
 * @param {string} gender - The gender of the voice. Can be 'NEUTRAL', 'MALE', or 'FEMALE'.
 * @param {Discord.message} message - The Discord message that invoked the command
 * @return {Promise<void>}
 */
async function sayInVC(textToSay, gender, message) {

    // Match tagged members and replace their IDs with their usernames
    const matchedUserIDTags = [...textToSay.matchAll(DISCORD_USER_TAG_REGEX)];
    for (matchedIDTag of matchedUserIDTags) {
        const matchedIDTagString = matchedIDTag.toString();
        const matchedID = matchedIDTagString.substring(3, matchedIDTagString.length - 1);
        const matchedUser = await discordClient.users.fetch(matchedID).catch(err => {});
        if (matchedUser)
            textToSay = textToSay.replace(matchedIDTag, matchedUser.username);
    }

    // Match tagged channels and replace their IDs with their names
    const matchedChannelIDTags = [...textToSay.matchAll(DISCORD_CHANNEL_TAG_REGEX)];
    for (matchedIDTag of matchedChannelIDTags) {
        const matchedIDTagString = matchedIDTag.toString();
        const matchedID = matchedIDTagString.substring(2, matchedIDTagString.length - 1);
        const matchedChannel = await discordClient.channels.fetch(matchedID);
        if (matchedChannel) 
            textToSay = textToSay.replace(matchedIDTag, matchedChannel.name);
    }

    let sayInVCPromise = new Promise(async function (myResolve, myReject) {

        try { 
            // Check if caller is in a voice channel
            if (!message.member.voice || !message.member.voice.channel)
                throw new BotError(replyMessages['joinVC']);
        
            const callerVoiceChannel = message.member.voice.channel;

            // Check if bot is talking in a voice channel
            const isTalking = await checkIfBotIsTalking(message);
            if (isTalking) 
                throw new BotError(replyMessages['waitSpeaking']);

            // Check if there is text to say
            if (textToSay == '') 
                throw new BotError(replyMessages['nothingToSay']);

            // Reset disconnect timer
            clearTimeout(vcDisconnectTimer);

            // Join caller's voice channel
            const callerVCConnection = await callerVoiceChannel.join();

            // Export message to audio file
            let audioFilePath = VOICE_TEMP_FILE_PATH + '/' + message.id + '.mp3';
            console.log('create: ' + audioFilePath);

            const request = {
                input: {text: textToSay},
                voice: {languageCode: 'en-US', ssmlGender: gender},
                audioConfig: {audioEncoding: 'MP3', speakingRate: 1.0},
            };

            // Performs the text-to-speech request
            const [response] = await ttsClient.synthesizeSpeech(request);

            // Write the binary audio content to a local file
            const writeFile = util.promisify(fs.writeFile);
            await writeFile(audioFilePath, response.audioContent, 'binary');

            // Play the audio file in the voice channel
            const dispatcher = callerVCConnection.play(audioFilePath);

            // When finished, clean up and leave voice channel
            const cleanupFunction = () => {
                dispatcher.destroy();
                console.log('delete: ' + audioFilePath);
                fs.unlink(audioFilePath, (err) => {
                    if (err) throw err;
                });
                vcDisconnectTimer = setTimeout(() => {callerVoiceChannel.leave()}, VC_TIMEOUT_DURATION);
                myResolve();
            };
            dispatcher.on('finish', cleanupFunction);    

        }          
        catch (err) {
            myReject(err);
        }    
    });

    return sayInVCPromise;
}

/**
 * Plays an audio files in the voice channel of the invoker
 * @param {string} audioFilePath - The path to the audio file
 * @param {Discord.message} message - The Discord message that invoked the command
 * @return {Promise<void>}
 */
async function playFileInVC(audioFilePath, message) {
    let singInVCPromise = new Promise(async function (myResolve, myReject) {

        try { 
            // Check if caller is in a voice channel
            if (!message.member.voice || !message.member.voice.channel)
                throw new BotError(replyMessages['joinVC']);
        
            const callerVoiceChannel = message.member.voice.channel;

            // Check if bot is talking in a voice channel
            const isTalking = await checkIfBotIsTalking(message);
            if (isTalking) 
                throw new BotError(replyMessages['waitSpeaking']);

            // Reset disconnect timer
            clearTimeout(vcDisconnectTimer);

            // Join caller's voice channel
            const callerVCConnection = await callerVoiceChannel.join();

            // Play the audio file in the voice channel
            const dispatcher = callerVCConnection.play(audioFilePath);

            // When finished, clean up and leave voice channel
            const cleanupFunction = () => {
                dispatcher.destroy();
                vcDisconnectTimer = setTimeout(() => {callerVoiceChannel.leave()}, VC_TIMEOUT_DURATION);
                myResolve();
            };
            dispatcher.on('finish', cleanupFunction);    

        }          
        catch (err) {
            myReject(err);
        }    
    });

    return singInVCPromise;

}