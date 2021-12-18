const fs = require('fs');
const util = require('util');
const ytdl = require('ytdl-core');

/**
 * Plays audio from a YouTube video in the voice channel of the invoker
 * @param {string} url - The YouTube URL
 * @param {Discord.message} message - The Discord message that invoked the command
 * @return {Promise<void>}
 */
 async function playYouTubeLink(url, message) {
    let singInVCPromise = new Promise(async function (myResolve, myReject) {

        try { 
            if (message.member.voice && message.member.voice.channel) {
                
                const callerVoiceChannel = message.member.voice.channel;

                // Check if caller is in a voice channel
                if (!message.member.voice || !message.member.voice.channel)
                throw new BotError(replyMessages['joinVC']);

                // Check if bot is talking in a voice channel
                const isTalking = await checkIfBotIsTalking(message);
                if (isTalking) 
                    throw new BotError(replyMessages['waitSpeaking']);

                // Reset disconnect timer
                clearTimeout(vcDisconnectTimer);

                // Join caller's voice channel
                const callerVCConnection = await callerVoiceChannel.join()
                    .catch(err => {throw new BotError(replyMessages['cannotJoin']);});
                const dispatcher = callerVCConnection.play(ytdl(url, { quality: 'highestaudio' , volume: 0.2}));                      

                // When finished, clean up and leave voice channel
                const cleanupFunction = () => {
                    dispatcher.destroy();
                    vcDisconnectTimer = setTimeout(() => {callerVoiceChannel.leave()}, VC_TIMEOUT_DURATION);
                    myResolve();
                };
                dispatcher.on('finish', cleanupFunction);   

            }   

        }          
        catch (err) {
            myReject(err);
        }    
    });

    return singInVCPromise;

}

// Register commands
require("./commands.js");