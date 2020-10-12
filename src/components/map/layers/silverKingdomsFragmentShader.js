// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying highp vec2 vUv;

  uniform highp sampler2D Texture;
  uniform highp float Opacity;

  vec4 Sample(float base, float outerGlowSize, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 5.0 / 255., 0., value) / (1. + .5 * maxGrad) * Opacity;
    vec4 col = vec4(249. / 255., 252. / 255., 252. / 255., alpha);

    float outerGlow = smoothstep(aa + outerGlowSize / 255., 5. / 255., value);
    if (value > 5. / 255.) {
      col = vec4(.0, .0, .0, .35 * outerGlow * Opacity);
    }

    return col;
  }

  void main() {
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);

    vec4 map = texture2D(Texture, vUv);

    gl_FragColor = Sample(map.r, 20., maxGrad);
  }
`
