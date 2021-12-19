class Track {
  /**
     * Constructor
     *
     * @param {*} voiceChannel Where to play the track
     * @param {*} resource The audio resource associated with the track
     * @param {*} props Track description properties
     */
  constructor (voiceChannel, resource, props) {
    this.voiceChannel = voiceChannel
    this.resource = resource
    this.props = props
  }
}

module.exports.Track = Track
