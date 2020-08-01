// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define ALPHA .65

  varying highp vec2 vUv;

  uniform highp sampler2D Texture;
  uniform highp sampler2D ShadesmarTexture;
  uniform bool Shadesmar;

  vec4 Sample(float base, float outerGlowSize, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad);
    vec4 col = vec4(0.9, .9, .9, alpha);

    float outerGlow = smoothstep(aa + 2. * outerGlowSize / 255., .0 / 255., value);
    if (value > .0) {
      col = vec4(.0, .0, .0, .35 * outerGlow);
    }

    return col;
  }

  vec4 SampleShadesmar(float base, float maxGrad) {
    float value = base - 0.5;
    float aa = maxGrad / 24.;

    float alpha = smoothstep(aa + 2.0 / 255., 0., value) / (1. + .5 * maxGrad);

    vec4 col = vec4(59. / 255., 138. / 255., 189. / 255., alpha);

    float outerGlow = smoothstep(aa + 50. / 255., 8. / 255., value);
    if (value > .0) {
      col = vec4(.0, .0, .0, outerGlow);
    }

    return col;
  }

  void main() {
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);
    
    vec4 map = texture2D(Texture, vUv);
    vec4 shadesmarMap = texture2D(ShadesmarTexture, vUv);

    vec4 texel1Large = Sample(map.r, 37., maxGrad);
    vec4 texel1Small = Sample(map.g, 18., maxGrad);    
    vec4 texel1 = vec4(mix(texel1Large.rgb, texel1Small.rgb, texel1Small.a), texel1Large.a + texel1Small.a);

    vec4 texel2Large = SampleShadesmar(shadesmarMap.r, maxGrad);
    vec4 texel2Small = SampleShadesmar(shadesmarMap.g, maxGrad);
    vec4 texel2 = vec4(mix(texel2Large.rgb, texel2Large.rgb, texel2Small.a), texel2Large.a + texel2Small.a);

    gl_FragColor = Shadesmar ? texel2 : texel1;
  }
`
