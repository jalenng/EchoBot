const { botClient } = require('../../bot')

const DISCORD_USER_TAG_REGEX = /<@![0-9]+>/g
const DISCORD_CHANNEL_TAG_REGEX = /<#[0-9]+>/g

// Match tagged members and replace their IDs with their usernames
async function convertDiscordUserTags (message) {
  const matchedUserIDTags = [...message.matchAll(DISCORD_USER_TAG_REGEX)]
  for (const matchedIDTag of matchedUserIDTags) {
    const matchedIDTagString = matchedIDTag.toString()
    const matchedID = matchedIDTagString.substring(3, matchedIDTagString.length - 1)
    const matchedUser = await botClient.users.fetch(matchedID).catch(console.log)
    if (matchedUser) { message = message.replace(matchedIDTag, matchedUser.username) }
  }
  return message
}

// Match tagged channels and replace their IDs with their names
async function convertDiscordChannelTags (message) {
  const matchedChannelIDTags = [...message.matchAll(DISCORD_CHANNEL_TAG_REGEX)]
  for (const matchedIDTag of matchedChannelIDTags) {
    const matchedIDTagString = matchedIDTag.toString()
    const matchedID = matchedIDTagString.substring(2, matchedIDTagString.length - 1)
    const matchedChannel = await botClient.channels.fetch(matchedID)
    if (matchedChannel) { message = message.replace(matchedIDTag, matchedChannel.name) }
  }
  return message
}

async function convertTags(message) {
  message = await convertDiscordUserTags(message)
  message = await convertDiscordChannelTags(message)
  return message
}

module.exports.convertDiscordUserTags = convertDiscordUserTags
module.exports.convertDiscordChannelTags = convertDiscordChannelTags
module.exports.convertTags = convertTags
