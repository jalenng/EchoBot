const fs = require('fs')
const path = require('path')

let logfileDir = './logs/'

/**
 * Enum for log type values.
 * @readonly
 * @enum {string}
 */
const LogType = {
  Info: 'Info',
  Error: 'Error'
}

/**
 * Sets the directory for the log file
 *
 * @param {string} path
 */
function setLogfileDir (path) {
  logfileDir = path
}

/**
 * Records a message to the log
 *
 * @param {*} message - The message to log
 * @param {LogType} [logType=LogType.Info] - The type of log
 * @param {boolean} [consoleOnly=false] - Whether to only log to the console
 */
async function log (message, logType = LogType.Info, consoleOnly = false) {
  const dateObj = new Date()

  // Get logfile path
  const dateStr = getDateString(dateObj)
  const logfileName = `${dateStr}.log`
  const logfilePath = path.resolve(logfileDir, logfileName)

  // Get log string
  const header = generateLogHeader(dateObj, logType)
  const logString = generateLogString(header, message)

  // Log string to console
  console.log(logString)

  // Log string to file if desired
  if (!consoleOnly) { write(logfilePath, logString) }
}

/**
 * Generates a log header string with the time and log type
 *
 * @param {Date} logDate - The date of the log
 * @param {LogType} logType - The type of log
 * @returns {string} - The log header
 */
function generateLogHeader (date, type) {
  const time = getTimeString(date)
  type = type.toUpperCase()
  return `${time} ${type}`.padEnd(15, ' ') + ': '
}

/**
 * Formats the message such that subsequent lines are indented, and
 * lines wrap at 80 characters.
 *
 * @param {string} header - The header that will appear on the left side of the message.
 * @param {(string || object)} message - The messsage to log
 */
function generateLogString (header, message) {
  if (!message) return ''

  // Convert object to string
  if (typeof message === 'object') {
    message = JSON.stringify(message, null, 2)
  }

  // Split message into lines
  const lines = message.toString().split('\n')

  // Wrap lines at 80 characters
  for (let i = 0; i < lines.length; i++) {
    // Trim whitespace
    const line = lines[i].trim()

    // If the line is longer than 80 characters,
    if (line.length > 80) {
      // The breakpoint is the space before the 80th character
      let breakPoint = line.lastIndexOf(' ', 80)

      // If there is no space before the 80th character, break at the 80th character
      if (!breakPoint > -1) { breakPoint = 80 }

      // Break the line
      lines[i] = lines[i].substring(0, breakPoint)

      // Add the remainder of the line to a new line
      const newLine = line.substring(breakPoint)
      lines.splice(i + 1, 0, newLine)
    }
  }

  // Indent each line
  for (let i = 0; i < lines.length; i++) {
    if (i === 0) lines[i] = header + lines[i]
    else lines[i] = ' '.repeat(header.length) + lines[i]
  }

  // Join lines into a single string
  return lines.join('\n')
}

/**
 * Writes a string followed by a newline character to a file.
 * Wrapper for fs.writeFile.
 *
 * @param {string} filePath - The path to the file to write to
 * @param {string} text - The text to write to the file
 */
function write (filePath, text) {
  fs.appendFile(
    filePath,
    text + '\n',
    (error) => {
      // If there was an error writing to the file,
      // log the error to the console only
      if (error) { log(error, LogType.Error, true) }
    }
  )
}

/**
 * Given a Date object, returns a string in the format HH:MM:SS
 *
 * @param {Date=} dateObj - The Date object to convert to a string. If not provided, the current date will be used.
 * @returns {string} - The formatted Date
 */
function getTimeString (dateObj) {
  if (!dateObj) dateObj = new Date()

  // Pad hours, mins, and secs with leading zeros
  const hours = dateObj.getHours().toString().padStart(2, '0')
  const mins = dateObj.getMinutes().toString().padStart(2, '0')
  const secs = dateObj.getSeconds().toString().padStart(2, '0')

  return `${hours}:${mins}:${secs}`
}

/**
 * Given a Date object, returns a string in the format YYYY-MM-DD
 *
 * @param {Date=} dateObj - The Date object to convert to a string. If not provided, the current date will be used.
 * @returns {string} - The formatted Date
 */
function getDateString (dateObj) {
  if (!dateObj) dateObj = new Date()

  // Pad year, month, and date with leading zeros
  const year = dateObj.getFullYear().toString() // Already a 4-digit number
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const date = dateObj.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${date}`
}

module.exports.LogType = LogType
module.exports.setLogfileDir = setLogfileDir
module.exports.log = log
