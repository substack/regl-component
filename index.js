var Nano = require('nanocomponent')
var defregl = require('deferred-regl')
var mregl = require('./multi.js')

module.exports = Root

function Root (regl, opts) {
  if (!(this instanceof Root)) return new Root(regl, opts)
  Nano.call(this)
  this.components = []
  this._regl = regl
  this._opts = opts
}
Root.prototype = Object.create(Nano.prototype)

Root.prototype.create = function () {
  var c = new Component()
  this.components.push(c)
  if (this._mregl) c._setMregl(this._mregl)
  return c
}

Root.prototype.createElement = function () {
  var self = this
  if (!this._element) {
    this._element = document.createElement('div')
    this.canvas = document.createElement('canvas')
    this._element.appendChild(this.canvas)
  }
  return this._element
}

Root.prototype.update = function () { return false }

Root.prototype.load = function () {
  this._mregl = mregl(this._regl, this.canvas, this._opts)
  for (var i = 0; i < this.components.length; i++) {
    this.components[i]._setMregl(this._mregl)
  }
}

Root.prototype.unload = function () {
  this._mregl.destroy()
  this._element = null
  this.canvas = null
  for (var i = 0; i < this.components.length; i++) {
    this.components[i]._setMregl(null)
  }
  this._mregl = null
}

function Component (opts) {
  var self = this
  if (!(self instanceof Component)) return new Component(opts)
  Nano.call(self)
  if (!opts) opts = {}
  self._elwidth = null
  self._elheight = null
  self._opts = opts
  self._element = document.createElement('div')
  self._element.style.display = 'inline-block'
  if (opts.width) {
    self._element.style.width = opts.width + 'px'
    self._elwidth = opts.width
  }
  if (opts.height) {
    self._element.style.height = opts.height + 'px'
    self._elheight = opts.height
  }
  self.regl = defregl()
  self._regl = null
  self._mregl = null
  self._mreglqueue = []
}
Component.prototype = Object.create(Nano.prototype)

Component.prototype._getMregl = function (fn) {
  if (this._mregl) fn(this._mregl)
  else {
    if (!this._mreglqueue) this._mreglqueue = []
    this._mreglqueue.push(fn)
  }
}
Component.prototype._setMregl = function (mr) {
  this._mregl = mr
  if (this._mreglqueue) {
    for (var i = 0; i < this._mreglqueue.length; i++) {
      this._mreglqueue[i](this._mregl)
    }
  }
  this._mreglqueue = null
}

Component.prototype.update = function (props) {
  return this._elwidth !== props.width
    || this._elheight !== props.height
}

Component.prototype.createElement = function (props) {
  var self = this
  if (props.width !== this._elwidth) {
    this._element.style.width = props.width + 'px'
    this._elwidth = props.width
  }
  if (props.height !== this._elheight) {
    this._element.style.height = props.height + 'px'
    this._elheight = props.height
  }
  return this._element
}

Component.prototype.load = function () {
  var self = this
  if (self._regl) return
  self._getMregl(function (mregl) {
    self._regl = mregl(self._element)
    self.regl.setRegl(self._regl)
  })
}

Component.prototype.unload = function () {
  if (this._regl) {
    this._regl.destroy()
    this._regl = null
    this.regl.setRegl(null)
  }
}
