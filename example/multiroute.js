var app = require('choo')()
var html = require('choo/html')
var rcom = require('../')(require('regl'))
var anormals = require('angle-normals')

var chart = require('conway-hart')
var shapes = [ 'mI', 'jT', 'djmeD', 'pO' ]
var demos = {}
function getDemo (shape) {
  if (!demos[shape]) {
    demos[shape] = fromMesh(rcom.create(), chart(shape))
  }
  demos[shape].draw()
  return demos[shape]
}
app.use(function (state, emitter) {
  emitter.on('pushState', function () { demos = {} })
})

app.route('/', function (state, emit) {
  return html`<body>
    ${rcom.render()}
    ${shapes.map(function (shape) {
      var demo = getDemo(shape)
      return html`<div>
        <h1><a href="#${shape}">${shape}</a></h1>
        ${demo.render({ width: 400, height: 150 })}
        <hr>
      </div>`
    })}
  </body>`
})
app.route('/:shape', function (state, emit) {
  var demo = getDemo(state.params.shape)
  if (!demo) return html`<body>not found</body>`
  return html`<body>
    ${rcom.render()}
    <h1>${state.params.shape}</h1>
    <h6><a href="/">back</a></h6>
    ${demo.render({ width: 800, height: 400 })}
  </body>`
})
app.mount('body')

function fromMesh (rc, mesh) {
  var draw = rc.regl({
    frag: `
      precision highp float;
      varying vec3 vnorm;
      void main () {
        gl_FragColor = vec4(vnorm*0.5+0.5,1);
      }
    `,
    vert: `
      precision highp float;
      attribute vec3 position, normal;
      varying vec3 vnorm;
      uniform float aspect;
      void main () {
        vnorm = normal;
        gl_Position = vec4(position.xy*vec2(1,aspect)*0.3,position.z*0.1+0.1,1);
      }
    `,
    uniforms: {
      aspect: function (context) {
        return context.viewportWidth / context.viewportHeight
      }
    },
    attributes: {
      position: mesh.positions,
      normal: anormals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells
  })
  rc.regl.clear({ color: [0,0,0,1], depth: true })
  return { render: rc.render.bind(rc), draw: draw }
}
