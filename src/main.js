require('dotenv').config() // Load environment variables from .env

// Bot
require('./bot')

// Core
require('./core/activity-updater')
require('./core/command-system')
require('./core/voice-system')

// Add-ons
require('./addons/google-tts')
require('./addons/youtube-playback')
require('./addons/quoter')
