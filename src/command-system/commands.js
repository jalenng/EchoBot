const { registerCommand } = require('./command-registry.js');

/**
 * Help
 */
registerCommand({
    keyword: 'help', 
    description: 'Sends a help message',
    func: async (member, channel, args) => {
        return 'in the works...';
    }
});

/**
 * Repeat
 */
registerCommand({
    keyword: 'repeat', 
    description: 'Repeats a message',
    options: [
        {
            name: 'message',
            type: 'STRING',
            description: 'The message to repeat',
            required: true,
        }
    ],
    func: async (member, channel, args) => {
        let text = args.message;
        if (text.length > 0)
            return text;    // Repeat the argument
        return 
    }
});