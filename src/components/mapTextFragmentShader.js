// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define ALPHA .65

  float threshold = 0.1;

  varying highp vec2 vUv;

  uniform highp sampler2D Texture;
  uniform highp sampler2D ShadesmarTexture;
  uniform highp sampler2D PatternTexture;
  uniform highp sampler2D TransitionTexture;
  uniform highp float Transition;
  uniform highp float HoveredItem;

  vec4 Sample(float base, bool hovered, float noise, float innerGlowSize, float outerGlowSize, float strokeSize, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad);
    vec4 col = vec4(1., .92, .5, alpha);
    vec3 innerGlowColor = vec3(146. / 255., 93. / 255., 43. / 255.);

    if (hovered) {
      outerGlowSize *= 2.0;
      col = vec4(20. / 255., 143. / 255., 218. / 255., alpha);
      innerGlowColor = vec3(.5, .81, 1.);
    }

    float innerGlow = smoothstep(-innerGlowSize / 255. - aa, .0, value);
    if (value < .0) {
      col = mix(col, vec4(innerGlowColor, 1.), innerGlow * 0.5 * (innerGlow + (1. - innerGlow) * noise));
    }

    float outerGlow = smoothstep(aa + outerGlowSize / 255., .0 / 255., value);
    if (value > .0) {
      col = vec4(.0, .0, .0, .35 * outerGlow);
    }

    float stroke = smoothstep(aa * 0.5 + strokeSize / 255., 0., abs(value - 1. / 255.)) / (1. + maxGrad);

    col = mix(col, vec4(87. / 255., 79. / 255., 70. / 255., 1.), stroke);

    return col;
  }

  vec4 SampleShadesmar(float noise, vec2 vUv, float maxGrad) {
    float value = texture2D(ShadesmarTexture, vUv).r - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad);

    vec4 col = vec4(59. / 255., 138. / 255., 189. / 255., alpha);

    col = mix(col, vec4(1., 1., 1., 1.), noise * 0.35);

    float outerGlow = smoothstep(aa + 50. / 255., 8. / 255., value);
    if (value > .0) {
      col = vec4(.0, .0, .0, outerGlow);
    }

    return col;
  }

  void main() {
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);
    
    float noise = texture2D(PatternTexture, vUv * vec2(16., 8.)).r;
    
    vec4 map = texture2D(Texture, vUv);
    
    bool hovered = HoveredItem > .0 && map.b * 255. == HoveredItem;

    vec4 texel1Large = Sample(map.r, hovered, noise, 24., 37., 3., maxGrad);
    vec4 texel1Small = Sample(map.g, hovered, noise, 12., 18., 2., maxGrad);    
    vec4 texel1 = vec4(mix(texel1Large.rgb, texel1Small.rgb, texel1Small.a), texel1Large.a + texel1Small.a);
    
    vec4 texel2 = SampleShadesmar(noise, vUv, maxGrad);

    vec4 transitionTexel = texture2D(TransitionTexture, vUv);
    float r = Transition * (1.0 + threshold * 2.0) - threshold;
    float mixf = clamp((transitionTexel.r - r) * (1.0 / threshold), 0.0, 1.0);

    gl_FragColor = mix(texel1, texel2, 1.0 - mixf);
  }
`
