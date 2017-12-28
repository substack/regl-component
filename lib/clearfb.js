// hack to get around regl.clear() issue

module.exports = function (regl) {
  return regl({
    frag: `
      precision highp float;
      uniform vec4 color;
      void main () {
        gl_FragColor = color;
      }
    `,
    vert: `
      precision highp float;
      attribute vec2 position;
      void main () {
        gl_Position = vec4(position,0,1);
      }
    `,
    attributes: {
      position: [-4,-4,-4,+4,+4,+0]
    },
    elements: [[0,1,2]],
    uniforms: {
      color: regl.prop('color')
    },
    framebuffer: regl.prop('framebuffer'),
    depth: { func: 'always' }
  })
}
