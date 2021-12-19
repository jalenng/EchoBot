const { registerCommand } = require('../command-system');
const { synthesizeSpeech } = require('./speaker.js');
const { Track, enqueue, ensureVoiceChannel } = require('../voice-system');

/**
 * Say
 */
registerCommand({
    keyword: 'say',
    description: 'Speaks a message in a voice channel',
    options: [
        {
            name: 'message',
            type: 'STRING',
            description: 'The message to speak',
            required: true,
        }
    ],
    func: async (member, channel, args) => {
        
        let message = args.message;
        
        // Get the voice channel
        let voiceChannel = ensureVoiceChannel(member);

        // Create a track
        let resource = await synthesizeSpeech(message);
        let track = new Track(
            member, 
            voiceChannel, 
            resource, 
            {
                title: message
            }
        );

        // Enqueue the track
        await enqueue(track);

        return `**Added to queue -** ${message}`;
    }
});