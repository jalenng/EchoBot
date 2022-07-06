const { botClient } = require('../../bot')

const DISCORD_TAG_REGEX = /<(?:[^\d>]+|:[A-Za-z0-9]+:)\w+>/g

const DISCORD_USER_TAG_REGEX = /<@!?(?<id>([0-9]+))>/g
const DISCORD_CHANNEL_TAG_REGEX = /<#(?<id>([0-9]+))>/g
const DISCORD_EMOJI_TAG_REGEX = /<a?:(?<name>[^:]+):(?<id>([0-9]+))>/g

/**
 * Matches tagged members and channels in a string
 * and replaces their IDs with their names.
 *
 * @param {string} input - The string to convert
 * @returns {string} - The converted string
 */
async function convertTags (input) {
  const matchedTags = [...input.matchAll(DISCORD_TAG_REGEX)]

  for (const tag of matchedTags) {
    // Attempt to match for user tag.
    // If so, swap tag with username.
    const userMatch = [...tag.toString().matchAll(DISCORD_USER_TAG_REGEX)][0]
    const userID = userMatch?.groups?.id

    if (userID) {
      const user = await botClient.users.fetch(userID).catch(console.log)
      input = input.replace(tag, user.username)
      continue
    }

    // Attempt to match for channel tag.
    // If so, swap tag with channel name.
    const channelMatch = [...tag.toString().matchAll(DISCORD_CHANNEL_TAG_REGEX)][0]
    const channelID = channelMatch?.groups?.id

    if (channelID) {
      const channel = await botClient.channels.fetch(channelID)
      input = input.replace(tag, channel.name)
      continue
    }

    // Attempt to match for emoji tag.
    // If so, swap tag with emoji name.
    const emojiMatch = [...tag.toString().matchAll(DISCORD_EMOJI_TAG_REGEX)][0]
    const emojiName = emojiMatch?.groups?.name

    if (emojiName) {
      input = input.replace(tag, emojiName)
      continue
    }
  }

  return input
}

module.exports.convertTags = convertTags
