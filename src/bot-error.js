module.exports = class extends Error {
    /**
     * Initializes a BotError exception
     * @param {String} message - The error message to output
     */
    constructor(message = "Error!") {
        super();
        this.name = "BotError";
        this.message = message;
    }
}