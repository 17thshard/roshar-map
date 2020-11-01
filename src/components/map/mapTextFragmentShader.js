// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  float threshold = 0.1;

  varying highp vec2 vUv;

  uniform highp sampler2D Texture;
  uniform highp sampler2D ShadesmarTexture;
  uniform highp sampler2D PatternTexture;
  uniform highp sampler2D TransitionTexture;
  uniform highp float Transition;
  uniform highp float HoveredItem;
  uniform highp float ActiveItem;
  uniform highp float HoverProgress;
  uniform highp float ActiveProgress;
  uniform highp float Opacity;

  vec4 Sample(float base, float highlight, float highlightProgress, float noise, float innerGlowSize, float outerGlowSize, float strokeSize, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad) * Opacity;
    vec4 col = vec4(1., .92, .5, alpha);
    vec3 innerGlowColor = vec3(146. / 255., 93. / 255., 43. / 255.);
    
    outerGlowSize += highlight * highlightProgress * outerGlowSize;
    col = mix(col, vec4(20. / 255., 143. / 255., 218. / 255., alpha), highlight * highlightProgress);
    innerGlowColor = mix(innerGlowColor, vec3(.5, .81, 1.), highlight * highlightProgress);

    float innerGlow = smoothstep(-innerGlowSize / 255. - aa, .0, value);
    col = mix(col, vec4(innerGlowColor, Opacity), innerGlow * 0.5 * (innerGlow + (1. - innerGlow) * noise));

    float outerGlow = smoothstep(aa + outerGlowSize / 255., .0 / 255., value);
    col = mix(col, vec4(.0, .0, .0, .35 * outerGlow * Opacity), max(sign(value), .0));

    float stroke = smoothstep(aa * 0.5 + strokeSize / 255., 0., abs(value - 1. / 255.)) / (1. + maxGrad);

    col = mix(col, vec4(87. / 255., 79. / 255., 70. / 255., Opacity), stroke);

    return col;
  }

  vec4 SampleShadesmar(float base, float highlight, float highlightProgress, float noise, float outerGlowStart, float outerGlowSize, float outerGlowAlpha, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 1.0 / 255., 0., value) / (1. + .5 * maxGrad) * Opacity;

    vec4 col = vec4(59. / 255., 138. / 255., 189. / 255., alpha);
    
    col = mix(col, vec4(213. / 255., 106. / 255., 15. / 255., alpha), highlight * highlightProgress);

    col = mix(col, vec4(1., 1., 1., Opacity), noise * 0.35);

    float outerGlow = smoothstep(aa + outerGlowSize / 255., outerGlowStart / 255., value) * outerGlowAlpha;
    col = mix(col, vec4(.0, .0, .0, outerGlow * Opacity), max(sign(value), .0));

    return col;
  }

  void main() {
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);

    float noise = texture2D(PatternTexture, vUv * vec2(16., 8.)).r;

    highp vec4 map = texture2D(Texture, vUv);
    highp vec4 shadesmarMap = texture2D(ShadesmarTexture, vUv);

    highp float hoverValue = mix(map.b * 255., shadesmarMap.b * 255., max(sign(Transition - 0.5), 0.0));
    float highlight = sign(HoveredItem) * max(sign(1e-2 - abs(hoverValue - HoveredItem)), .0);
    float activeHighlight = sign(ActiveItem) * max(sign(1e-2 - abs(hoverValue - ActiveItem)), .0);
    highlight = min(highlight + activeHighlight, 1.);
    float highlightProgress = mix(HoverProgress, ActiveProgress, activeHighlight);

    vec4 texel1Large = Sample(map.r, highlight, highlightProgress, noise, 24., 37., 3., maxGrad);
    vec4 texel1Small = Sample(map.g, highlight, highlightProgress, noise, 12., 18., 2., maxGrad);
    vec4 texel1 = vec4(mix(texel1Large.rgb, texel1Small.rgb, texel1Small.a), texel1Large.a + texel1Small.a);

    vec4 texel2Large = SampleShadesmar(shadesmarMap.r, highlight, highlightProgress, noise, 8., 50., 1., maxGrad);
    vec4 texel2Small= SampleShadesmar(shadesmarMap.g, highlight, highlightProgress, noise, 0., 25., 0.8, maxGrad);
    vec4 texel2 = vec4(mix(texel2Large.rgb, texel2Small.rgb, texel2Small.a), texel2Large.a + texel2Small.a);

    vec4 transitionTexel = texture2D(TransitionTexture, vUv);
    float r = Transition * (1.0 + threshold * 2.0) - threshold;
    float mixf = clamp((transitionTexel.r - r) * (1.0 / threshold), 0.0, 1.0);

    gl_FragColor = mix(texel1, texel2, 1.0 - mixf);
  }
`
