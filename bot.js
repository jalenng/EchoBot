// Requires
const Discord = require('discord.js');
const TTS = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const ytdl = require('ytdl-core');
const { resolve } = require('path');
require('dotenv').config();

// Constants
const comnmandPrefix = '/';
const sayInVCAudioPath = 'sayInVCFiles';
const vcTimeoutDuration = 60000;
const discordUserIDRegex = /<@![0-9]+>/g;
const discordChannelIDRegex = /<#[0-9]+>/g;

// Message and embed constants
const checkDMsMessage = '***check your DMs.***';
const defaultGreetingMessage = '***Welcome to the server, <member>!*** ';
const errorMessage = '***something went wrong. Please try again.*** ';
const greetingMessages = require('./greetingMessages.json');
const helpCommandMessages = [
    '(If you need help, type `/help` or `/?`.) ',
    '(If you need help, type `/help` or `/?` in a text channel I am in.)'
];
const joinVCMessage = '***please join a voice channel and try again.*** ';
const noQuotesMessage = '***no quotes were found in #quotes.*** ';
const nothingToSayMessage = '***give me something to say.*** ' + helpCommandMessages[0];
const rejectedDMMessage = '***I am not accepting DMs right now. ***' + helpCommandMessages[1];
const waitSpeakingMessage = '***please wait until I\'m done speaking.*** ';

const helpEmbed = new Discord.MessageEmbed()
    .setTitle('Bot Commands')
    .setDescription('')
    .setColor(0xff0000)
    .addFields(
        { name: '`/help`\n`/?`', value: 'Sends a DM to caller with information about this bot\'s commands.' },
        { name: '`/say [m/f] <text>`\n`/s [m/f] <text>`', value: 'Speaks text in the voice channel the caller is in.'},
        { name: '`/sayquote [m/f]`\n`/sq [m/f]`', value: 'Selects a random quote from the 100 most recent messages in **#quotes**, then speaks it in the voice channel the caller is in.' },
        { name: '`/sbday <name>`', value: 'Sings "Happy Birthday" in the voice channel the caller is in.' }
    )
    .setFooter('Bot by Jaygantic#2171', 'https://avatars2.githubusercontent.com/u/42555186?s=460&v=4');

// Bot Error
BotError.prototype = Object.create(Error.prototype);
function BotError(message = errorMessage) {
    this.name = "BotError";
    this.message = message;
}

// Bot functions
async function checkIfBotIsTalking(message) {
    if (!message.guild.voice || !message.guild.voice.channel) return false;
    const botVoiceState = message.guild.voice;
    const botVCConnection = await botVoiceState.channel.join();
    return botVCConnection && botVCConnection.dispatcher;
}

async function sayInVC(textToSay, gender, message) {

    // Match tagged members and replace their IDs with their usernames
    const matchedUserIDTags = [...textToSay.matchAll(discordUserIDRegex)];
    for (matchedIDTag of matchedUserIDTags) {
        const matchedIDTagString = matchedIDTag.toString();
        const matchedID = matchedIDTagString.substring(3, matchedIDTagString.length - 1);
        const matchedUser = await discordClient.users.fetch(matchedID);
        if (matchedUser) 
            textToSay = textToSay.replace(matchedIDTag, matchedUser.username);
    }

    // Match tagged channels and replace their IDs with their names
    const matchedChannelIDTags = [...textToSay.matchAll(discordChannelIDRegex)];
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
            throw new BotError(joinVCMessage);
        
            const callerVoiceChannel = message.member.voice.channel;

            // Check if bot is talking in a voice channel
            const isTalking = await checkIfBotIsTalking(message);
            if (isTalking) 
                throw new BotError(waitSpeakingMessage);

            // Check if there is text to say
            if (textToSay == '') 
                throw new BotError(nothingToSayMessage);

            // Reset disconnect timer
            clearTimeout(vcDisconnectTimer);

            // Join caller's voice channel
            const callerVCConnection = await callerVoiceChannel.join();

            // Export message to audio file
            let audioFilePath = sayInVCAudioPath + '/' + message.id + '.mp3';
            console.log('create: ' + audioFilePath);

            const request = {
                input: {text: textToSay},
                voice: {languageCode: 'en-US', ssmlGender: gender},
                audioConfig: {audioEncoding: 'MP3', speakingRate: 1.0},
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

async function singInVC(audioFilePath, message) {
    let singInVCPromise = new Promise(async function (myResolve, myReject) {

        try { 
            // Check if caller is in a voice channel
            if (!message.member.voice || !message.member.voice.channel)
            throw new BotError(joinVCMessage);
        
            const callerVoiceChannel = message.member.voice.channel;

            // Check if bot is talking in a voice channel
            const isTalking = await checkIfBotIsTalking(message);
            if (isTalking) 
                throw new BotError(waitSpeakingMessage);

            // Reset disconnect timer
            clearTimeout(vcDisconnectTimer);

            // Join caller's voice channel
            const callerVCConnection = await callerVoiceChannel.join();

            // Play the audio file in the voice channel
            const dispatcher = callerVCConnection.play(audioFilePath);

            // When finished, clean up and leave voice channel
            const cleanupFunction = () => {
                dispatcher.destroy();
                vcDisconnectTimer = setTimeout(() => {callerVoiceChannel.leave()}, vcTimeoutDuration);
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

// vars for bot
var vcDisconnectTimer;

// Helper functions
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

// Create clients
const discordClient = new Discord.Client({
    presence: {
        status: 'online',
        activity: {
            name: 'your commands',
            type: 'LISTENING'
        }
    }
});
const ttsClient = new TTS.TextToSpeechClient();

// Client setup
discordClient.on('ready', function() {
    console.log('Ready for action.');

    var user = discordClient.user;
    var type = user.bot ? 'BOT' : 'USER'
    console.log('Tag: %s (%s) \n', user.tag, type);

});

// Greetings
discordClient.on('guildMemberAdd', guildMember => {
    try {
        const generalChannel = guildMember.guild.channels.cache.find(ch => ch.name === 'general');
        if (generalChannel) {
            const guildID = guildMember.guild.id;
            const serverGreetingMessages = greetingMessages[guildID];
            const mentionString = `<@${guildMember.user.id}>`;
            var greetingMessage = defaultGreetingMessage;
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
});

// Commands system
discordClient.on('message', async message => {

    // Handle DM's
    if (!message.guild) {
        if (message.author != discordClient.user)
            message.reply(rejectedDMMessage);
        return;
    }

    var messageContent = message.content;

    // Check if message is command
    if (messageContent.indexOf(comnmandPrefix) != 0) return;

    var trimmedContent = messageContent.substring(1, messageContent.length);
    var command = splitNextSpace(trimmedContent);

    try {
        var reactionStatus = await message.react('💭');
        
        switch (command[0]) {

            // Sends a DM to caller with information about this bot's commands.
            // Syntax: /help or /?
            case 'help': 
            case '?':

                var DMChannel = await message.author.createDM();
                await DMChannel.send(helpEmbed);
                await message.reply(checkDMsMessage);

                break;
    
            // Randomly draw a quote from the most recent 100 messages in #quotes, then speaks it in voice channel the caller is in.
            // Syntax: /sayquote or /sq
            case 'sayquote': 
            case 'sq':
    
                // Check for gender arguments
                var gender = 'NEUTRAL';
                var textToSay = command[1];
    
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
                    throw new BotError(noQuotesMessage);
    
                // Get quotes from channel
                var quotes = await quotesChannel.messages.fetch({limit: 100});
    
                // Ignore if quotes channel is empty
                if (quotes.size == 0)
                    throw new BotError(noQuotesMessage);

                var quotesKey = quotes.randomKey(1);
                textToSay = quotes.get(quotesKey[0]).content;
    
                await sayInVC(textToSay, gender, message).catch(err => {throw err;});
                break;
    
            // Speaks text in the voice channel the caller is in.
            // Syntax: /say [m/f] <text> or /s [m/f] <text>
            case 'say':
            case 's':
    
                // Check for gender arguments
                var gender = 'NEUTRAL';
                var textToSay = command[1];
    
                var splitContent = splitNextSpace(command[1]);
                if (splitContent[0] == 'm') {
                    gender = 'MALE';
                    textToSay = splitContent[1];
                }
                else if (splitContent[0] == 'f') {
                    gender = 'FEMALE';
                    textToSay = splitContent[1];
                }

                await sayInVC(textToSay, gender, message).catch(err => {throw err;});
                break;            
    
            // Sings "Happy Birthday" in the voice channel the caller is in.
            // Syntax: /sbday <name>
            case 'sbday':
    
                var gender = 'NEUTRAL';
                var name = command[1];
                if (name == "") throw new BotError(nothingToSayMessage);

                await singInVC('singInVCFiles/birthday_1.mp3', message); 
                await sayInVC(name, gender, message); 
                await singInVC('singInVCFiles/birthday_2.mp3', message); 
                break;

        }

        message.react('✅')
    }
    catch (err) {
        if (err instanceof BotError) {
            message.reply(err.message);
        }
        else {
            message.reply(errorMessage);
            console.log(err)
        }
        message.react('❌')
    }
    reactionStatus.remove();

});

discordClient.login(require(process.env.DISCORD_CREDENTIALS).token);