const { promisify } = require('util')
const {
  joinVoiceChannel,
  createAudioPlayer,
  entersState,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  VoiceConnectionDisconnectReason
} = require('@discordjs/voice')

// How long to wait for a voice connection to be established
const CONNECTION_TIMEOUT = 10_000 // 10 seconds

// How long to wait for an audio player to start playing
const PLAYER_STATE_CHANGE_TIMEOUT = 10_000 // 10 seconds

// How long to wait while the player is idle to disconnect the voice connection
const DISCONNECTION_TIMEOUT = 300_000 // 5 minutes

const wait = promisify(setTimeout)

/**
 * @class Represents a subscription to a guild.
 * A subscription contains a queue of tracks to be played in the guild's voice channels.
 */
class Subscription {
  /**
   * Instantiates a new subscription to a guild
   * @param {*} guild
   */
  constructor (guild) {
    this.guild = guild
    this.audioPlayer = createAudioPlayer()
    this.voiceConnection = null
    this.queue = []

    this.currentVoiceChannel = null
    this.destroyConnectionTimeout = null
    this.voiceConnectionDestroyed = true

    this.configureAudioPlayer()
  }

  /**
   * Enqueue a track. If the queue is empty, the track will start playing immediately.
   * @param {*} track - The track to enqueue
   */
  async enqueue (voiceChannel, track) {
    this.queue.push(track) // Add the track to the queue
    await this.processQueueUpdate() // Process the queue since we've updated it
  }

  /**
   * Plays a track on the audio player
   * @param {Track} track - The track to play on the audio player
   */
  async playOnAudioPlayer (track) {
    this.audioPlayer.play(track)

    // Wait for the track to start playing
    try {
      await entersState(this.audioPlayer, AudioPlayerStatus.Playing, PLAYER_STATE_CHANGE_TIMEOUT)
    } catch (error) {
      this.destroyVoiceConnection()
      this.next()
    }
  }

  /**
   * Joins a voice channel and updates the voice connection
   * @param {Discord.VoiceChannel} voiceChannel - The voice channel to join and connect to
   */
  async connectToVoiceChannel (voiceChannel) {
    this.clearDisconnectTimeout()

    // If the voice connection is already connected to the voice channel, do nothing
    if (this.currentVoiceChannel === voiceChannel) return

    // Join the voice channel
    const joinConfig = {
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    }
    if (this.voiceConnectionDestroyed) {
      this.voiceConnection = joinVoiceChannel(joinConfig)
    } else {
      this.voiceConnection.rejoin(joinConfig)
    }

    this.currentVoiceChannel = voiceChannel
    this.voiceConnectionDestroyed = false

    // Wait for the voice connection to be ready
    try {
      await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, CONNECTION_TIMEOUT)
    } catch (error) {
      this.destroyVoiceConnection()
      this.next()
    }

    // Configure the voice connection
    this.configureVoiceConnection()
  }

  /**
   * Handle a situation where the voice connection was disconnected
   * @param {*} newState - The new voice connection state used to determine whether to reconnect
   */
  async handleVoiceDisconnection (newState) {
    const doNotReconnect = newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014

    if (doNotReconnect) {
      // Do not reconnect
      try {
        // Wait for reconnection. The bot might have been moved to a different channel.
        await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, CONNECTION_TIMEOUT)
      } catch {
        // The bot was likely removed from the channel
        this.destroyVoiceConnection()
      }
    } else if (this.voiceConnection.rejoinAttempts < 5) {
      // Attempt to reconnect up to 5 times
      await wait((this.voiceConnection.rejoinAttempts + 1) * CONNECTION_TIMEOUT) // Wait time increases with each reconnection attempt
      this.voiceConnection.rejoinAttempts += 1
      this.voiceConnection.rejoin()
    } else {
      // Out of reconnection attempts
      this.destroyVoiceConnection()
    }
  }

  /**
   * Plays the next track in the queue
   */
  async next () {
    const stillPlaying = this.audioPlayer.state.status !== AudioPlayerStatus.Idle
    // If the player is still playing, stop it.
    // This should be enough to invoke the state change event handler and play the next track.
    if (stillPlaying) { this.audioPlayer.stop(true) } else {
      this.queue.shift() // Remove the track that just finished playing
      await this.processQueueUpdate() // Process the queue since we've updated it
    }
  }

  /**
   * Plays the first track in the queue
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
   * Stops the audio player and clears the queue
   */
  async stop () {
    // Stop the audio player
    this.audioPlayer.stop(true)
    await entersState(this.audioPlayer, AudioPlayerStatus.Idle, PLAYER_STATE_CHANGE_TIMEOUT)

    // Clear the queue
    this.queue = []
  }

  /**
   * Processes the queue after it has been updated
   */
  async processQueueUpdate () {
    // If the queue is empty, start counting down to destroy the voice connection
    if (this.queue.length === 0) {
      this.setDisconnectTimeout()
    } else if (this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
      // Else, if the player is not playing, play the first track in the queue
      await this.play()
    }
  }

  /**
   * Destroys the voice connection safely
   */
  async destroyVoiceConnection () {
    if (!this.voiceConnectionDestroyed) {
      this.voiceConnectionDestroyed = true
      this.currentVoiceChannel = null
      this.voiceConnection.destroy()
      await entersState(this.voiceConnection, VoiceConnectionStatus.Destroyed, CONNECTION_TIMEOUT)
    }
  }

  /**
   * CONFIGURATION FUNCTIONS
   */

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
    this.audioPlayer.on('error', (error) => {
      console.log(error)
      // Attempt to recover by playing the next track
      this.next()
    })
  }

  /**
   * Configures the voice connection.
   * Makes the voice connection handle disconnections and drop after a period of inactivity.
   *
   */
  configureVoiceConnection () {
    // Event handlers for voice connection state change
    this.voiceConnection.on('stateChange', async (oldState, newState) => {
      switch (newState.status) {
        case VoiceConnectionStatus.Disconnected:
          // Check whether to reconnect based on the new state.
          await this.handleVoiceDisconnection(newState)
          break

        case VoiceConnectionStatus.Destroyed:
          this.stop()
          break

        case VoiceConnectionStatus.Connecting:
        case VoiceConnectionStatus.Signalling:
          break
      }
    })
  }

  /**
   * TIMEOUT FUNCTIONS
   */

  /**
   * Sets the timeout for destroying the voice connection
   * after it has been idle for a period of time
   */
  setDisconnectTimeout () {
    if (!this.destroyConnectionTimeout) {
      this.destroyConnectionTimeout = setTimeout(() => {
        this.destroyVoiceConnection()
      }, DISCONNECTION_TIMEOUT)
    }
  }

  /**
   * Clears the timeout for destroying the voice connection
   */
  clearDisconnectTimeout () {
    if (this.destroyConnectionTimeout) {
      clearTimeout(this.destroyConnectionTimeout)
      this.destroyConnectionTimeout = null
    }
  }
}

// Exports
module.exports.Subscription = Subscription
