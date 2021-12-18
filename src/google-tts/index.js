const TTS = require('@google-cloud/text-to-speech');

// TTS Client
const ttsClient = new TTS.TextToSpeechClient();

/**
 * Speaks a message in the voice channel of the invoker
 * @param {string} textToSay - The text for the bot to say
 * @param {string} gender - The gender of the voice. Can be 'NEUTRAL', 'MALE', or 'FEMALE'.
 * @param {Discord.message} message - The Discord message that invoked the command
 * @return {Promise<void>}
 */
async function sayInVC(message, textToSay, voiceOptions) {

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

            // Reset disconnect timer
            clearTimeout(vcDisconnectTimer);

            // Join caller's voice channel
            const callerVCConnection = await callerVoiceChannel.join()
                .catch(err => {throw new BotError(replyMessages['cannotJoin']);});

            // Export message to audio file
            let audioFilePath = VOICE_TEMP_FILE_PATH + '/' + message.id + '.mp3';
            console.log('create: ' + audioFilePath);

            const request = {
                input: {text: textToSay},
                voice: {languageCode: 'en-US', ssmlGender: gender, ...voiceOptions},
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

// Register commands
require("./commands.js");