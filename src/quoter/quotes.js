/**
 * Draw a random quote from a guild's quotes channel
 * 
 * @param {*} guild 
 * @returns 
 */
 module.exports.drawRandom = async (guild) => {
    // Get quotes channel
    let channel = guild.channels.cache.find(ch => ch.name === 'quotes');
    
    // Ignore if quotes channel DNE or is not text-based
    if (!channel || !channel.isText())
        throw new BotError("Create a #quotes channel to use this command.");

    // Get quotes from channel
    let quotes = await channel.messages.fetch({limit: 100});

    // Ignore if quotes channel is empty
    if (quotes.size == 0)
        throw new BotError("There are no quotes in #quotes.");

    let quotesKey = quotes.randomKey(1);
    let quote = quotes.get(quotesKey[0]).content;

    return quote;
}