const DISCORD_USER_TAG_REGEX = /<@![0-9]+>/g;
const DISCORD_CHANNEL_TAG_REGEX = /<#[0-9]+>/g;

// Match tagged members and replace their IDs with their usernames
let convertDiscordUserTags = (message) => {
    const matchedUserIDTags = [...textToSay.matchAll(DISCORD_USER_TAG_REGEX)];
    for (matchedIDTag of matchedUserIDTags) {
        const matchedIDTagString = matchedIDTag.toString();
        const matchedID = matchedIDTagString.substring(3, matchedIDTagString.length - 1);
        const matchedUser = await discordClient.users.fetch(matchedID).catch(err => { });
        if (matchedUser)
            textToSay = textToSay.replace(matchedIDTag, matchedUser.username);
    }
}

// Match tagged channels and replace their IDs with their names
let convertDiscordChannelTags = (message) => {
    const matchedChannelIDTags = [...textToSay.matchAll(DISCORD_CHANNEL_TAG_REGEX)];
    for (matchedIDTag of matchedChannelIDTags) {
        const matchedIDTagString = matchedIDTag.toString();
        const matchedID = matchedIDTagString.substring(2, matchedIDTagString.length - 1);
        const matchedChannel = await discordClient.channels.fetch(matchedID);
        if (matchedChannel)
            textToSay = textToSay.replace(matchedIDTag, matchedChannel.name);
    }
}

module.exports.convertDiscordUserTags = convertDiscordUserTags;
module.exports.convertDiscordChannelTags = convertDiscordChannelTags;