const { registerCommand } = require('../command-system');

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
    func: async (message, args) => {
        return 'in the works...';
    }
});

/**
 * Say quote
 */
registerCommand({
    keyword: 'sayquote', 
    description: 'Speaks a random quote in a voice channel',
    func: async (message, args) => {
        return 'in the works...';
    }
});