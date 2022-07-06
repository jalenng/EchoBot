const storage = require('node-persist')
const store = storage.create({
  dir: '../private/stores/google-tts',
  ttl: false
})

module.exports.store = store
