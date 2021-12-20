const { botClient } = require('../../bot')

const DISCORD_USER_TAG_REGEX = /<@![0-9]+>/g
const DISCORD_CHANNEL_TAG_REGEX = /<#[0-9]+>/g

/**
 * Matches tagged members and replace their IDs with their usernames
 *
 * @param {string} input - The string to convert
  * @returns {string} - The converted string
  */
async function convertDiscordMemberTags (input) {
  const matchedUserIDTags = [...input.matchAll(DISCORD_USER_TAG_REGEX)]
  for (const matchedIDTag of matchedUserIDTags) {
    const matchedIDTagString = matchedIDTag.toString()
    const matchedID = matchedIDTagString.substring(3, matchedIDTagString.length - 1)
    const matchedUser = await botClient.users.fetch(matchedID).catch(console.log)
    if (matchedUser) { input = input.replace(matchedIDTag, matchedUser.username) }
  }
  return input
}

/**
 * Matches tagged channels in a string and replaces their IDs with their names.
 *
 * @param {string} input - The string to convert
 * @returns {string} - The converted string
 */
async function convertDiscordChannelTags (input) {
  const matchedChannelIDTags = [...input.matchAll(DISCORD_CHANNEL_TAG_REGEX)]
  for (const matchedIDTag of matchedChannelIDTags) {
    const matchedIDTagString = matchedIDTag.toString()
    const matchedID = matchedIDTagString.substring(2, matchedIDTagString.length - 1)
    const matchedChannel = await botClient.channels.fetch(matchedID)
    if (matchedChannel) { input = input.replace(matchedIDTag, matchedChannel.name) }
  }
  return input
}

/**
 * Matches tagged members and channels in a string
 * and replaces their IDs with their names.
 *
 * @param {string} input - The string to convert
 * @returns {string} - The converted string
 */
async function convertTags (input) {
  input = await convertDiscordMemberTags(input)
  input = await convertDiscordChannelTags(input)
  return input
}

module.exports.convertDiscordUserTags = convertDiscordMemberTags
module.exports.convertDiscordChannelTags = convertDiscordChannelTags
module.exports.convertTags = convertTags
