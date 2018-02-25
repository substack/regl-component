# regl-component

element wrapper to manage multiple [regl][] contexts

This module uses [nanocomponent][] to provide a vanilla DOM wrapper on top of a
modified version of [multi-regl][], which shares a single webgl element among
all components.

[regl]: http://regl.party
[nanocomponent]: https://npmjs.com/package/nanocomponent
[multi-regl]: https://npmjs.com/package/multi-regl

# example

[view this demo](https://substack.neocities.org/example/regl-component.html)

``` js
var app = require('choo')()
var html = require('choo/html')
var rcom = require('regl-component')(require('regl'))
var anormals = require('angle-normals')

var chart = require('conway-hart')
var demos = [
  fromMesh(rcom.create(), chart('mI')),
  fromMesh(rcom.create(), chart('jT')),
  fromMesh(rcom.create(), chart('djmeD')),
  fromMesh(rcom.create(), chart('pO'))
]

app.route('/', function (state, emit) {
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
  rc.on('regl', function (regl) {
    var draw = regl({
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
    regl.clear({ color: [0,0,0,1], depth: true })
    draw()
  })
  return rc
}
```

# api

``` js
var reglComponent = require('regl-component')
```

## var rcom = reglComponent(createRegl, opts)

Create an `rcom` component given a `createRegl` constructor function.

Any `opts` are passed to the regl constructor.

## var rootElem = rcom.render()

Generate the root element `rootElem` that takes care of the full-screen canvas
overlay.

## var rc = rcom.create()

Create a component wrapper `rc`.

## var elem = rc.render(props)

Return a cached element `elem` given:

* `props.width` - element width
* `props.height` - element height

## rc.on('regl', function (regl) {})

Listen for the regl event to get a handle on a regl instance when a webgl
context is available. This event many fire multiple times if a context is lost
and re-initialized.

# install

npm install regl-component

# license

BSD
