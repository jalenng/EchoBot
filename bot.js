const Discord = require('discord.js');
const TTS = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
require('dotenv').config();

const discordAuth = require(process.env.DISCORD_CREDENTIALS);

const comnmandPrefix = '/';
const sayInVCAudioPath = 'say_in_vc_files';
const vcTimeoutDuration = 60000;
var vcDisconnectTimer;

const say = require('say')

// Create clients
const discordClient = new Discord.Client({
    presence: {
        status: 'online',
        activity: {
            name: 'over this server',
            type: 'WATCHING'
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

// Command system
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

        console.log(command)

        switch (command[0]) {

            // Speak a random quote from #quotes in voice channel of caller.
            // Syntax: /sayquote
            case 'sayquote': 

                // Get quotes channel
                var quotesChannel = message.guild.channels.cache.find(ch => ch.name === 'quotes');

                // Ignore if quotes channel DNE or is not text-based
                if (!quotesChannel || !quotesChannel.isText()) {
                    message.reply('a quotes channel was not found on this server.')
                    return;
                }

                var quotes = await quotesChannel.messages.fetch({limit: 100});
                var quotesKey = quotes.randomKey(1);
                command[1] = quotes.get(quotesKey[0]).content;

            // Speak message in voice channel of caller.
            // Syntax: /say <message>
            case 'say':

                console.log(command[1]);

                // Check if caller is in voice channel
                var channel = message.member.voice.channel;
                if (channel) {

                    //Join voice channel
                    const connection = await channel.join();

                    // If currently talking, ignore
                    if (connection.dispatcher) {
                        message.reply('please wait until I\'m done speaking.');
                        return;
                    }

                    //Reset disconnect timer
                    clearTimeout(vcDisconnectTimer);

                    // Export message to audio file
                    let audioFilePath = sayInVCAudioPath + '/' + messageID + '.mp3';

                    const request = {
                        input: {text: command[1]},
                        voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
                        audioConfig: {audioEncoding: 'MP3'},
                    };

                    try {
                        // Performs the text-to-speech request
                        const [response] = await ttsClient.synthesizeSpeech(request)

                        // Write the binary audio content to a local file
                        const writeFile = util.promisify(fs.writeFile);
                        await writeFile(audioFilePath, response.audioContent, 'binary');

                        // Play the audio file in the voice channel
                        const dispatcher = connection.play(audioFilePath);
                        
                        message.delete();

                        // When finished, clean up and leave voice channel
                        dispatcher.on('finish', () => {

                            dispatcher.destroy();
                            fs.unlink(audioFilePath, function (err) {
                                if (err) throw err;
                            });
                            vcDisconnectTimer = setTimeout(() => {channel.leave()}, vcTimeoutDuration);

                        });
                    }          
                    catch (err) {
                        console.log('Failed to make TTS request.');
                        console.log(err)
                        message.reply('there was an error. Please try again.');
                    }       

                    // Old code using say.js
                    
                    // say.export(command[1], null, 1.0, audioFilePath, (err) => {
                    //     if (err) throw err;

                    //     // Play the audio file in the voice channel
                    //     const dispatcher = connection.play(audioFilePath)

                    //     // When finished, clean up and leave voice channel
                    //     dispatcher.on('finish', () => {
                    //         dispatcher.destroy();
                    //         fs.unlink(audioFilePath, function (err) {
                    //             if (err) throw err;
                    //         });
                    //         vcDisconnectTimer = setTimeout(() => {channel.leave()}, vcTimeoutDuration);
                    //     })

                    // })
                                    
                } 
                else {
                    message.reply('please join a voice channel and try again.');
                }
                break;
                
        }

    }

});

discordClient.login(discordAuth.token);