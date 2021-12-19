const {
  joinVoiceChannel,
  createAudioPlayer,
  entersState,
  AudioPlayerStatus,
  VoiceConnectionStatus
} = require('@discordjs/voice')

class Subscription {
  /**
     * Constructor
     *
     * @param {*} guild
     */
  constructor (guild) {
    this.guild = guild
    this.audioPlayer = createAudioPlayer()
    this.voiceConnection = null
    this.queue = []

    this.configureAudioPlayer()
  }

  /**
     * Configures the audio player.
     * Makes the audio player play the next track in the queue when the current track is finished.
     */
  configureAudioPlayer () {
    // Event handler for state change
    this.audioPlayer.on('stateChange', (oldState, newState) => {
      switch (newState.status) {
        // Case: Playing --> Idle (indicating that the track has finished playing)
        case AudioPlayerStatus.Idle:
          if (oldState.status !== AudioPlayerStatus.Idle) { this.next() }
          break
      }
    })

    // Event handler for error
    this.audioPlayer.on('error', (err) => {
      console.log(err)
      // Attempt to recover by playing the next track
      this.next()
    })
  }

  /**
     * Adds a track to the queue and attempts to play it
     *
     * @param {*} track The track to add
     */
  async enqueue (voiceChannel, track) {
    this.queue.push(track) // Add the track to the queue
    await this.processQueueUpdate() // Process the queue since we've updated it
  }

  /**
     * Plays a track on the audio player
     * @param {*} voiceChannel
     */
  async playOnAudioPlayer (track) {
    this.audioPlayer.play(track)

    // Wait for the track to start playing
    try {
      await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 10_000)
    } catch (err) {
      this.voiceConnection.destroy()
      this.next()
    }
  }

  /**
     * Joins a voice channel and updates the voice connection
     *
     * @param {*} voiceChannel
     */
  async connectToVoiceChannel (voiceChannel) {
    this.voiceConnection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    })

    // Wait for the voice connection to be ready
    try {
      await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 10_000)
    } catch (err) {
      this.voiceConnection.destroy()
      this.next()
    }

    // Configure the voice connection
    this.configureVoiceConnection()
  }

  /**
     * Configures the voice connection.
     * Makes the voice connection drop after a period of inactivity.
     *
     */
  configureVoiceConnection () {
    // Event handlers for voice connection state change
    this.voiceConnection.on('stateChange', async (oldState, newState) => {
      switch (newState.status) {
        case (VoiceConnectionStatus.Disconnected):

          if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
            /**
                         * If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
                         * but there is a chance the connection will recover itself if the reason of the disconnect was due to
                         * switching voice channels. This is also the same code for the bot being kicked from the voice channel,
                         * so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
                         * the voice connection.
                         */
            try {
              await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 10_000)
              // Probably moved voice channel
            } catch {
              this.voiceConnection.destroy()
              // Probably removed from voice channel
            }
          } else if (this.voiceConnection.rejoinAttempts < 5) {
            /**
                         * The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                         */
            await wait((this.voiceConnection.rejoinAttempts + 1) * 10_000)
            this.voiceConnection.rejoin()
          } else {
            /**
                         * The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
                         */
            this.voiceConnection.destroy()
          }

          break

        case VoiceConnectionStatus.Destroyed:
          this.stop()
          break

        case VoiceConnectionStatus.Connecting:
        case VoiceConnectionStatus.Signalling:
          if (!this.readyLock) {
            /**
                         * In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
                         * before destroying the voice connection. This stops the voice connection permanently existing in one of these
                         * states.
                         */
            this.readyLock = true
            try {
              await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000)
            } catch {
              if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) { this.voiceConnection.destroy() }
            } finally {
              this.readyLock = false
            }
          }
          break
      }
    })
  }

  /**
     * Plays the next track in the queue
     */
  async next () {
    if (this.audioPlayer.state.status !== AudioPlayerStatus.Idle) { this.audioPlayer.stop(true) } else {
      this.queue.shift() // Remove the track that just finished playing
      await this.processQueueUpdate() // Process the queue since we've updated it
    }
  }

  /**
     * Plays the current track
     * @param {*} track
     */
  async play () {
    // Get track
    const track = this.queue[0]

    // Connect to the voice channel
    await this.connectToVoiceChannel(track.voiceChannel)

    // Subscribe the audio player to the voice connection
    this.voiceConnection.subscribe(this.audioPlayer)

    // Play the track resource
    await this.playOnAudioPlayer(track.resource)
  }

  /**
     * Processes the queue after it has been updated
     */
  async processQueueUpdate () {
    // If the queue is empty, start counting down
    if (this.queue.length === 0) { return }

    // Else, if the player is not playing, play the first track in the queue
    if (this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
      await this.play()
    }
  }
}

// Exports
module.exports.Subscription = Subscription
