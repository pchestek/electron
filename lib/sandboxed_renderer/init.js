/* eslint no-eval: "off" */
/* global binding, preloadPath, process, Buffer */
const events = require('events')

const ipcRenderer = new events.EventEmitter()

const proc = new events.EventEmitter()
// eval in window scope:
// http://www.ecma-international.org/ecma-262/5.1/#sec-10.4.2
const geval = eval

require('../renderer/api/ipc-renderer-setup')(ipcRenderer, binding)

binding.onMessage = function (channel, args) {
  ipcRenderer.emit.apply(ipcRenderer, [channel].concat(args))
}

binding.onExit = function () {
  proc.emit('exit')
}

let appName = "TRUC"
let appVersion = "0.1"
let appTempPath = "C:\\TEMP"
const crashReporter = require('./crash-reporter')(appName, appVersion, appTempPath, binding)

const ipcBus = require('../common/api/ipc-bus')('renderer', ipcRenderer)

const preloadModules = new Map([
  ['electron', {
    ipcRenderer: ipcRenderer,
    crashReporter: crashReporter
  }]
])

function preloadRequire (module) {
  if (preloadModules.has(module)) {
    return preloadModules.get(module)
  }
  throw new Error('module not found: ' + module)
}

// Code for activate ipcRenderer in renderer sandboxed process
let preloadSandbox = `(function(require, process, Buffer, global, ipcRenderer) {


if (location.href !== 'about:blank') {
  addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('child-loaded', window.opener == null, document.body.innerHTML)
  }, false)
}
})`

let preloadSandboxFn = geval(preloadSandbox)
preloadSandboxFn(preloadRequire, proc, Buffer, global, ipcRenderer)

// Fetch the source for the preload
let preloadSrc = ipcRenderer.sendSync('ELECTRON_BROWSER_READ_FILE', preloadPath)
if (preloadSrc.err) {
  throw new Error(preloadSrc.err)
}

// Wrap the source into a function receives a `require` function as argument.
// Browserify bundles can make use of this, as explained in:
// https://github.com/substack/node-browserify#multiple-bundles
//
// For example, the user can create a browserify bundle with:
//
//     $ browserify -x electron preload.js > renderer.js
//
// and any `require('electron')` calls in `preload.js` will work as expected
// since browserify won't try to include `electron` in the bundle and will fall
// back to the `preloadRequire` function above.
// NOTE : ipcBus is available by default
let preloadWrapperSrc = `(function(require, process, Buffer, global, ipcBus) {

window.ipcBus = ipcBus

${preloadSrc.data}
})`

let preloadFn = geval(preloadWrapperSrc)
preloadFn(preloadRequire, proc, Buffer, global, ipcBus)
