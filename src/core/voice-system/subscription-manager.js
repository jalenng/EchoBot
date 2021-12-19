const { BotError } = require('../../bot/bot-error.js')
const { Subscription } = require('./subscription.js')

const subscriptions = new Map() // Map guild snowflakes to subscriptions

/**
 * Enqueue a track to the voice channel the invoker is in
 *
 * @param {*} member
 * @param {*} track
 * @returns
 */
const enqueue = async (track) => {
  // Get the voice channel and guild from the member
  const voiceChannel = track.voiceChannel
  const guild = voiceChannel.guild

  // Try to get a guild subscription
  const subscription = ensureGuildSubscription(guild)

  // Enqueue the track to the subscription
  subscription.enqueue(voiceChannel, track)
}

/**
 * Returns the queue of the guild the invoker is in
 *
 * @param {*} guild
 * @returns
 */
const getQueue = async (guild) => {
  // Try to get a guild subscription
  const subscription = ensureGuildSubscription(guild)

  // Return the queue
  return subscription.queue
}

/**
 * Skips the current track in the queue of the guild the invoker is in
 *
 * @param {*} guild
 * @returns
 */
const next = async (guild) => {
  // Try to get a guild subscription
  const subscription = ensureGuildSubscription(guild)

  // Skip the current track
  subscription.next()
}

/**
 * Returns the voice channel of the given member.
 * Throws a bot error if the member is not in a voice channel
 *
 * @param {*} member
 * @returns
 */
const ensureVoiceChannel = (member) => {
  // Try to get the voice channel
  const voiceChannel = member.voice.channel

  // If the voice channel doesn't exist, throw an error
  if (!voiceChannel) { throw new BotError('Join a voice channel, then try again.') }

  // Else, return the voice channel
  return voiceChannel
}

/**
 * Returns the guild subscription of the given member.
 * Creates a new subscription if one doesn't exist for the guild.
 *
 * @param {*} guild
 * @param {Boolean} create
 * @returns
 */
const ensureGuildSubscription = (guild) => {
  // Try to get the guild subscription
  let subscription = subscriptions.get(guild.id)

  // If the subscription doesn't exist, create it
  if (!subscription) {
    subscription = new Subscription(guild)
    subscriptions.set(guild.id, subscription)
  }

  // Return the subscription
  return subscription
}

// Export the functions
module.exports.enqueue = enqueue
module.exports.getQueue = getQueue
module.exports.ensureVoiceChannel = ensureVoiceChannel
module.exports.ensureGuildSubscription = ensureGuildSubscription
module.exports.next = next
