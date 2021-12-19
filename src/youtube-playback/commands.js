const { registerCommand } = require('../command-system');
const { streamYouTubeAudio } = require('./downloader');
const { Track, enqueue, ensureVoiceChannel } = require('../voice-system');

/**
 * YouTube playback
 */
registerCommand({
    keyword: 'yt', 
    description: 'Plays audio from a YouTube video',
    options: [
        {
            name: 'url',
            type: 'STRING',
            description: 'The URL of the resource to play',
            required: true,
        }
    ],
    func: async (member, channel, args) => {        
        // Get the voice channel
        let voiceChannel = ensureVoiceChannel(member);

        // Create a track
        let message = args.message;
        let resource = await streamYouTubeAudio(args.url);
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

        return `**Added to queue -** ${args.url}`;
    }
});
