class Track {
  /**
     * Constructor
     *
     * @param {*} member Who queued the track
     * @param {*} voiceChannel Where to play the track
     * @param {*} resource The audio resource associated with the track
     * @param {*} props Track description properties
     */
  constructor (member, voiceChannel, resource, props) {
    this.member = member
    this.voiceChannel = voiceChannel
    this.resource = resource
    this.props = props
  }
}

module.exports.Track = Track
