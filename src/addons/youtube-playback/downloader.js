const ytdl = require('ytdl-core')
const {
  createAudioResource,
  StreamType
} = require('@discordjs/voice')

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

// Exports
module.exports.streamYouTubeAudio = streamYouTubeAudio
