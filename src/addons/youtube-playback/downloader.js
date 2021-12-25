const ytdl = require('ytdl-core')
const ytsr = require('ytsr')
const { BotError } = require('../../bot/bot-error')

const {
  createAudioResource,
  StreamType
} = require('@discordjs/voice')

/**
 * Returns an AudioResource with a YouTube audo stream
 *
 * @param {string} url - The YouTube URL
 * @returns {Discord.AudioResource} - The audio resource with the YouTube audio stream
 */
async function streamYouTubeAudio (url) {
  // Validate URL
  if (!ytdl.validateURL(url)) return null

  // Make a stream from the response
  const stream = await ytdl(
    url,
    {
      quality: 'highestaudio',
      volume: 0.2,
      f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
      highWaterMark: 1 << 26, // 64 MB
      filter: 'audioonly'
    }
  )

  // Return an audio resource from the stream
  return createAudioResource(stream, {
    inputType: StreamType.Arbitrary
  })
}

/**
 * Retrieves metadata from a YouTube URL
 */
async function getYouTubeMetadata (url) {
  // Validate URL
  if (!ytdl.validateURL(url)) return null

  // Get metadata
  const metadata = await ytdl.getInfo(url)

  // Return metadata
  return metadata
}

/**
 * Processes an argument, which can be a YouTube URL or a search query.
 * Returns the URL or the first result from a search query.
 * @param {string} arg - The argument to process
 */
async function getURLFromArg (arg) {
  const isValidUrl = ytdl.validateURL(arg)

  // If the argument is not a valid url, try to search for it
  if (isValidUrl) { return arg }

  // Search for the argument
  const searchResults = await ytsr(arg, { limit: 1 })
  if (!searchResults || !searchResults.items || searchResults.items.length <= 0) {
    throw new BotError(`No results found for the search query "${arg}"`)
  }
  return searchResults.items[0].url
}

// Exports
module.exports.streamYouTubeAudio = streamYouTubeAudio
module.exports.getYouTubeMetadata = getYouTubeMetadata
module.exports.getURLFromArg = getURLFromArg
