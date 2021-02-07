module.exports = {
    botError: BotError
}

BotError.prototype = Object.create(Error.prototype);

/**
 * Initializes a BotError exception
 * @param {string} message - The error message to output
 */
function BotError(message = replyMessages['generalError']) {
    this.name = "BotError";
    this.message = message;
}