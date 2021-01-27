// Requires
const Discord = require('discord.js');
const TTS = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const ytdl = require('ytdl-core');
require('dotenv').config();

const comnmandPrefix = '/';
const sayInVCAudioPath = 'say_in_vc_files';
const vcTimeoutDuration = 60000;

// Message and embed constants
const checkDMsMessage = '***check your DMs.***'
const errorMessage = '***something went wrong. Please try again.***'
const joinVCMessage = '***please join a voice channel and try again.***'
const noQuotesMessage = '***no quotes were found in #quotes.***'
const waitSpeakingMessage = '***please wait until I\'m done speaking.***'

const helpEmbed = new Discord.MessageEmbed()
    .setTitle('Bot Commands')
    .setDescription('')
    .setColor(0xff0000)
    .addFields(
        { name: '`/help` or `/?`', value: 'Sends a DM to caller with information about this bot\'s commands.' },
        { name: '`/say <text>` or `/s`', value: 'Speaks text in the voice channel the caller is in.' },
        { name: '`/sayquote` or `/sq`', value: 'Randomly draw a quote from the most recent 100 messages in **#quotes**, then speaks it in voice channel the caller is in.' }
    )
    .setFooter('Bot by Jaygantic#2171', 'https://avatars2.githubusercontent.com/u/42555186?s=460&v=4');

// vars for bot
var vcDisconnectTimer;

// const say = require('say')

// Create clients
const discordClient = new Discord.Client({
    presence: {
        status: 'online',
        activity: {
            name: 'to your commands',
            type: 'LISTENING'
        }
    }
});
const ttsClient = new TTS.TextToSpeechClient();

discordClient.on('ready', function() {
    console.log('Ready for action.');

    var user = discordClient.user;
    var type = user.bot ? 'BOT' : 'USER'
    console.log('Tag: %s (%s)', user.tag, type);

});

// Greetings
discordClient.on('guildMemberAdd', guildMember => {
    const generalChannel = message.guild.channels.cache.find(ch => ch.name === 'general');
    if (generalChannel)
        generalChannel.send(`Welcome to the server, ${member}`);
});

// Commands system
discordClient.on('message', async message => {

    // Ignore if message is a DM
    if (!message.guild) return;

    var messageContent = message.content;
    var messageID = message.id;

    // Check if message is command
    if (messageContent.indexOf(comnmandPrefix) == 0) {

        var trimmedContent = messageContent.substring(1, messageContent.length);
        var indexOfNextSpace = trimmedContent.indexOf(' ');
        
        // For one letter commands
        if (indexOfNextSpace == -1) indexOfNextSpace = trimmedContent.length;

        var command = [
            trimmedContent.substring(0, indexOfNextSpace),
            trimmedContent.substring(indexOfNextSpace + 1, trimmedContent.length)
        ];

        console.log(command);

        switch (command[0]) {

            // Sends a DM to caller with information about this bot's commands.
            // Syntax: /help or /?
            case 'help': 
            case '?':

                try {
                    var DMChannel = await message.author.createDM();
                    await DMChannel.send(helpEmbed);
                    await message.reply(checkDMsMessage);
                }
                catch (err) {
                    console.log(err)
                    message.reply(errorMessage);
                }
                break;

            // Randomly draw a quote from the most recent 100 messages in #quotes, then speaks it in voice channel the caller is in.
            // Syntax: /sayquote or /sq
            case 'sayquote': 
            case 'sq':

                // Get quotes channel
                var quotesChannel = message.guild.channels.cache.find(ch => ch.name === 'quotes');

                // Ignore if quotes channel DNE or is not text-based
                if (!quotesChannel || !quotesChannel.isText()) {
                    await message.reply(noQuotesMessage);
                    return;
                }

                // Get quotes from channel
                var quotes = await quotesChannel.messages.fetch({limit: 100});

                // Ignore if quotes channel is empty
                if (quotes.size == 0) {
                    await message.reply(noQuotesMessage);
                    return;
                }
                var quotesKey = quotes.randomKey(1);
                command[1] = quotes.get(quotesKey[0]).content;

                // Fall through to say

            // Speaks text in the voice channel the caller is in.
            // Syntax: /say <text> or /s
            case 'say':
            case 's':

                // Check if caller is in a voice channel
                if (message.member.voice && message.member.voice.channel) {

                    const callerVoiceChannel = message.member.voice.channel;

                    try {                      

                        // Check if bot is in a voice channel
                        if (message.guild.voice && message.guild.voice.channel) {
                            
                            const botVoiceState = message.guild.voice;

                            // Ignore if bot is currently talking
                            const botVCConnection = await botVoiceState.channel.join();
                            if (botVCConnection && botVCConnection.dispatcher) {
                                message.reply(waitSpeakingMessage);
                                return; 
                            }   
                        }
                        
                        // Reset disconnect timer
                        clearTimeout(vcDisconnectTimer);

                        // Join caller's voice channel
                        const callerVCConnection = await callerVoiceChannel.join();

                        // Export message to audio file
                        let audioFilePath = sayInVCAudioPath + '/' + messageID + '.mp3';
                        console.log('create: ' + audioFilePath);

                        const request = {
                            input: {text: command[1]},
                            voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
                            audioConfig: {audioEncoding: 'MP3'},
                        };

                        // Performs the text-to-speech request
                        const [response] = await ttsClient.synthesizeSpeech(request)

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
                            vcDisconnectTimer = setTimeout(() => {callerVoiceChannel.leave()}, vcTimeoutDuration);
                        };
                        dispatcher.on('finish', cleanupFunction);

                    }          
                    catch (err) {
                        
                        message.reply(errorMessage);
                        console.log(err)
                        
                    }         
                } 
                else {
                    message.reply(joinVCMessage);
                }
                break;
                

            // case 'yt':
            //     if (message.member.voice && message.member.voice.channel) {
            //         const callerVoiceChannel = message.member.voice.channel;

            //         // Check if bot is in a voice channel
            //         const botVoiceState = message.guild.voice;
            //         if (message.guild.voice && message.guild.voice.channel) {
                        
            //             // Ignore if bot is currently talking
            //             const botVCConnection = await message.guild.voice.channel.join();
            //             if (botVCConnection && botVCConnection.dispatcher) {
            //                 message.reply(waitSpeakingMessage);
            //                 return; 
            //             }   
            //         }
                    
            //         // Reset disconnect timer
            //         clearTimeout(vcDisconnectTimer);

            //         // Join caller's voice channel
            //         const callerVCConnection = await callerVoiceChannel.join();
            //         callerVCConnection.play(ytdl('https://www.youtube.com/watch?v=wDgQdr8ZkTw', { quality: 'highestaudio' , volume: 0.2}));
            //     }
            //     break;
        }

    }

});

// Repost messages on deletion
// discordClient.on('messageDelete', function(message) {
//     var authorName = message.author.username;
//     var content = message.content;
//     var channel = message.channel;
//     channel.send(authorName + ' said "' + content + '"')
// });

// Repost messages on edit
// discordClient.on('messageUpdate', function(oldMessage, newMessage) {
//     var authorName = oldMessage.author.username;
//     var content = oldMessage.content;
//     var channel = oldMessage.channel;
//     channel.send(authorName + ' once said "' + content + '"');
// });

discordClient.login(require(process.env.DISCORD_CREDENTIALS).token);