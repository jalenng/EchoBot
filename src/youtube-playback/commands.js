const { registerCommand } = require('../command-system');

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
    func: async (message, args) => {
        return 'in the works...';
    }
});
