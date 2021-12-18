const { registerCommand } = require('../command-system');

/**
 * Queue
 */
registerCommand({
    keyword: 'queue', 
    description: 'Shows the voice queue of the guild',
    func: async (message, args) => {
        return 'in the works...';
    }
});