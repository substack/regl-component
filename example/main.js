var app = require('choo')()
var html = require('choo/html')
var rcom = require('../')(require('regl'))
var anormals = require('angle-normals')

var chart = require('conway-hart')
var demos = [
  fromMesh(rcom.create(), chart('mI')),
  fromMesh(rcom.create(), chart('jT')),
  fromMesh(rcom.create(), chart('djmeD')),
  fromMesh(rcom.create(), chart('pO'))
]

var baseRoute = window.location.pathname
app.route(baseRoute + '/', function (state, emit) {
  return html`<body>
    ${rcom.render()}
    ${demos.map(function (demo) {
      return html`<div>
        ${demo.render({ width: 400, height: 150 })}
        <hr>
      </div>`
    })}
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
  draw()
  return rc
}
