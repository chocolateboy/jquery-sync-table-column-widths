// not much to do here until we have headless browser
// testing set up, but let's at least confirm the CommonJS
// exports work and match the ESM exports

const assert = require('assert')

const Plugin = require('./dist/index.js')

assert(typeof Plugin === 'function')
assert(Plugin.name === 'Plugin')

assert(typeof Plugin.register === 'function')
assert(Plugin.register.name === 'register')

const plugin = new Plugin()
assert(plugin instanceof Plugin)

assert(typeof plugin.syncColumnWidths === 'function')
assert(plugin.syncColumnWidths.name === 'syncColumnWidths')
