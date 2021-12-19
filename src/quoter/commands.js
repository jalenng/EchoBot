const { registerCommand } = require('../command-system');
const { synthesizeSpeech } = require('../google-tts')
const { drawRandom } = require('./quotes.js');
const { Track, enqueue, ensureVoiceChannel } = require('../voice-system');

/**
 * Say quote
 */
 registerCommand({
    keyword: 'quote',
    description: 'Draws a quote from #quotes and speaks it in a voice channel',
    func: async (member, channel, args) => {
        // Retrieve the quote
        let quote = await drawRandom(member.guild);
        
        // Get the voice channel and resource
        let voiceChannel = ensureVoiceChannel(member);
        let resource = await synthesizeSpeech(quote);

        // Create the track
        let track = new Track(
            member, 
            voiceChannel, 
            resource, {
            title: quote
        });

        // Enqueue the track
        await enqueue(track);

        return `**Added to queue -** ${quote}`;
    }
});