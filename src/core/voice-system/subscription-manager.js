const { BotError } = require('../../bot/bot-error.js')
const { Subscription } = require('./subscription.js')

const subscriptions = new Map() // Map guild snowflakes to subscriptions

/**
 * Enqueue a track to the voice channel the invoker is in
 *
 * @param {Track} track - the track to enqueue
 * @returns {boolean}
 */
const enqueue = async (track) => {
  // Get the voice channel and guild from the member
  const voiceChannel = track.voiceChannel
  const guild = voiceChannel.guild

  // Try to get a guild subscription
  const subscription = ensureGuildSubscription(guild)

  // Enqueue the track to the subscription
  return subscription.enqueue(voiceChannel, track)
}

/**
 * Returns the queue of the guild the invoker is in
 *
 * @param {Discord.Guild} guild - The guild to get the queue of
 * @returns {Track[]}
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
 * @param {Discord.Guild} guild - The guild to skip the track in
 * @returns {boolean}
 */
const next = async (guild) => {
  // Try to get a guild subscription
  const subscription = ensureGuildSubscription(guild)

  // Skip the current track
  return subscription.next()
}

/**
 * Returns the voice channel of the given member.
 * Throws a bot error if the member is not in a voice channel
 *
 * @param {Discord.GuildMember} member - The member to get the voice channel of
 * @returns {Discord.VoiceChannel}
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
 * @param {Discord} guild - The guild to get the subscription of
 * @param {Boolean} create - Whether or not to create a new subscription if one doesn't exist
 * @returns {Subscription}
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
