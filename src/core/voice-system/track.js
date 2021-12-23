/**
 * Represents a track property
 * @typedef {Object} TrackProperty
 * @property {string} name - The name of the property
 * @property {*} value - The value of the property
 */

class Track {
  /**
   * Constructor
   *
   * @param {Discord.voiceChannel} voiceChannel - The voice channel to play in
   * @param {Discord.AudioResource} resource - The audio resource to play
   * @param {Discord.GuildMember} member - The member who enqueued the track
   * @param {string} title - The title of the track
   * @param {TrackProperty[]} props - Track description properties
   */
  constructor (voiceChannel, resource, title, member, props = {}) {
    this.voiceChannel = voiceChannel
    this.resource = resource
    this.member = member
    this.title = title
    this.props = props
  }

  /**
   * Returns a Discord embed field representing the track
   * @returns {Discord.EmbedField}
   */
  getEmbedField () {
    // Description properties include the regular properties, voice channel, and member.
    const descProps = [...this.props]
    descProps.push({ name: 'Voice channel', value: this.voiceChannel })
    descProps.push({ name: 'Added by', value: this.member })

    // Join the properties into a string
    let description = descProps.map(prop => `*${prop.name}: ${prop.value}*`).join('\n')

    // Limit the length of the description to 150 characters. If the description is longer,
    // add an ellipsis to the end.
    if (description.length > 150) {
      description = description.substring(0, 150) + '...'
    }

    // Return the title and description as an embed field
    return {
      name: this.title,
      value: description
    }
  }
}

module.exports.Track = Track
