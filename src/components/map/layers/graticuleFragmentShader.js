// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying highp vec2 vUv;

  uniform highp sampler2D Texture;
  uniform highp sampler2D TextTexture;
  uniform highp float Opacity;

  vec4 Sample(float base, float offset, float maxGrad) {
    float value = base - offset;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad) * Opacity;
    vec4 col = vec4(1. - 249. / 255., 1. - 252. / 255., 1. - 252. / 255., alpha);

    return col;
  }

  vec4 SampleText(float base, float innerGlowSize, float outerGlowSize, float strokeSize, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;
    float textOpacity = Opacity / 0.3;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad) * textOpacity;
    vec4 col = vec4(1., .92, .5, alpha);
    vec3 innerGlowColor = vec3(146. / 255., 93. / 255., 43. / 255.);

    float innerGlow = smoothstep(-innerGlowSize / 255. - aa, .0, value);
    if (value < .0) {
      col = mix(col, vec4(innerGlowColor, textOpacity), innerGlow * 0.5 * (innerGlow + (1. - innerGlow)));
    }

    float outerGlow = smoothstep(aa + outerGlowSize / 255., .0 / 255., value);
    if (value > .0) {
      col = vec4(.0, .0, .0, .35 * outerGlow * textOpacity);
    }

    float stroke = smoothstep(aa * 0.5 + strokeSize / 255., 0., abs(value - 1. / 255.)) / (1. + maxGrad);

    col = mix(col, vec4(87. / 255., 79. / 255., 70. / 255., textOpacity), stroke);

    return col;
  }

  void main() {
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);

    vec4 map = texture2D(Texture, vUv);
    vec4 textMap = texture2D(TextTexture, vUv);

    vec4 fineTexel = Sample(map.r, 0.475, maxGrad);
    vec4 coarseTexel = Sample(map.g, 0.48, maxGrad);
    fineTexel.a *= 0.9;
    coarseTexel.a *= 1.5;
    vec4 lineTexel = vec4(mix(fineTexel.rgb, coarseTexel.rgb, coarseTexel.a), fineTexel.a + coarseTexel.a);
    vec4 textTexel = SampleText(textMap.r, 12., 18., 2., maxGrad);

    gl_FragColor = vec4(mix(lineTexel.rgb, textTexel.rgb, textTexel.a), lineTexel.a + textTexel.a);
  }
`
