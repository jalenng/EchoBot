module.exports = class extends Error {
    /**
     * Initializes a BotError exception
     * @param {String} message - The error message to output
     */
    constructor(message) {
        super();
        this.message = message;
    }
}