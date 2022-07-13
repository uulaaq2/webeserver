var config = require('./config.global');

config.app = {}
config.app.tokenExpiresIn = '14d'
config.app.showDevErrors = true

module.exports = config;