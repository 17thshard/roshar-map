// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying highp vec2 vUv;

  uniform highp sampler2D Texture;
  uniform highp sampler2D PatternTexture;
  uniform highp float Opacity;

  vec4 Sample(float base, float noise, float innerGlowSize, float outerGlowSize, float strokeSize, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad) * Opacity;
    vec4 col = vec4(236. / 255., 138. / 255., 55. / 255., alpha);
    vec3 innerGlowColor = vec3(213. / 255., 106. / 255., 15. / 255.);

    float innerGlow = smoothstep(-innerGlowSize / 255. - aa, .0, value);
    col = mix(col, vec4(innerGlowColor, Opacity), max(-sign(value), .0) * innerGlow * 0.5 * (innerGlow + (1. - innerGlow) * noise));

    float outerGlow = smoothstep(aa + outerGlowSize / 255., .0 / 255., value);
    col = mix(col, vec4(.0, .0, .0, .35 * outerGlow * Opacity), max(sign(value), .0));

    float stroke = smoothstep(aa * 0.5 + strokeSize / 255., 0., abs(value - 1. / 255.)) / (1. + maxGrad);

    col = mix(col, vec4(innerGlowColor, Opacity), stroke);

    return col;
  }

  void main() {
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);

    float noise = texture2D(PatternTexture, vUv * vec2(16., 8.)).r;
    vec4 map = texture2D(Texture, vUv);

    gl_FragColor = Sample(map.r, noise, 24., 60., 10., maxGrad);
  }
`
