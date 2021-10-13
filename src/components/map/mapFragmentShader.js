// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define ALPHA .65
  #define PI 3.141592653589793
  #define COLOR_CONV 0.00392156862
  #define CITY_DOTS_COUNT 0
  #define SHADESMAR_CITY_DOTS_COUNT 0

  varying highp vec2 vUv;

  uniform highp sampler2D BgTexture;
  uniform highp sampler2D OutlineTexture;
  uniform highp sampler2D ShadesmarBgTexture;
  uniform highp sampler2D TransitionTexture;
  uniform highp float Transition;
  uniform highp float PerpTransition;
  uniform highp vec2 PerpLocation;
  uniform highp float PerpPeriod;
  uniform highp float DimTransition;
  uniform highp float Time;
  uniform highp vec2 CityDots[CITY_DOTS_COUNT];
  uniform highp vec2 ShadesmarCityDots[SHADESMAR_CITY_DOTS_COUNT];

  float wave(float aa, float value, float threshold, float opacity, float scale) {
    float waveDist = abs(-threshold * COLOR_CONV + value - 0.5);

    return -smoothstep(aa + COLOR_CONV, 0., waveDist) * scale * opacity + 1.;
  }

  vec4 Sample(sampler2D bg, float borders, float waveDir, vec2 vUv, float maxGrad) {
    vec3 outlines = texture2D(OutlineTexture, vUv).rgb;
    float aa = maxGrad / 24.;
    float scale = (1. / (maxGrad * .5 + 1.));

    vec3 col = texture2D(bg, vUv).rgb;

    float outline = outlines.r - .5;
    col *= -smoothstep(0.5 * COLOR_CONV + aa, 0., outline) * scale * 0.6 + 1.;

    float waves = outlines.g;
    col *= wave(aa, waves, waveDir * 12., 0.35, scale);
    col *= wave(aa, waves, waveDir * 22., 0.25, scale);
    col *= wave(aa, waves, waveDir * 32., 0.15, scale);

    float borderSdf = outlines.b - .5;
    float borderFactor = smoothstep(20. * COLOR_CONV + aa, 0., borderSdf + 0.02) * borders;
    col = mix(col, vec3(178. * COLOR_CONV, COLOR_CONV, COLOR_CONV), borderFactor);

    return vec4(col, 1);
  }

  vec2 perturbations(float t) {
    return vec2(
      0.5 * (sin(t) + cos(3.3 * t) + sin(0.7 * t)) + sin(4. * Time + t) * 0.5,
      0.5 * (sin(0.9 * t + 2.) + cos(3.3 * 0.9 * t + 1.) + sin(0.7 * 0.9 * t + 1.5)) + sin(3. * Time + t) * 0.7
    );
  }

  void main() {
    vec2 mapPos = vUv * vec2(1024, 512) - vec2(512, 256);
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);

    vec4 texel1 = Sample(BgTexture, 1., 1., vUv, maxGrad);
    vec4 texel2 = Sample(ShadesmarBgTexture, 0., -1., vUv, maxGrad);

    for(int i = 0; i < CITY_DOTS_COUNT; i++) {
      texel1.rgb *= smoothstep(1., 1.2, length(mapPos - CityDots[i])) * 0.6 + 0.4;
    }
    for(int i = 0; i < SHADESMAR_CITY_DOTS_COUNT; i++) {
      texel2.rgb *= smoothstep(1., 1.2, length(mapPos - ShadesmarCityDots[i])) * 0.6 + 0.4;
    }

    vec4 transitionTexel = texture2D(TransitionTexture, vUv);
    float r = Transition * 1.2 - 0.1;
    float mixf = clamp((transitionTexel.r - r) * 10.0, 0.0, 1.0);

    vec4 color = mix(texel1, texel2, 1.0 - mixf);

    vec2 perpOffset = mapPos - PerpLocation;
    float distance = length(perpOffset);
    if (PerpTransition > 0. && distance < 20.) {
      float angle = atan(perpOffset.x, perpOffset.y);
      vec2 perturbation = perturbations(PerpPeriod * angle);

      if (angle < -3.05 || angle > 3.05) {
        vec2 leftPerturbation = perturbations(PerpPeriod * 3.05);
        vec2 rightPerturbation = perturbations(PerpPeriod * -3.05);
        perturbation = mix(leftPerturbation, rightPerturbation, smoothstep(0., PI - 3.05, mod(angle + 2. * PI, 2. * PI) - 3.05));
      }

      float transitionValue = smoothstep(0.0, 1.0, PerpTransition);

      vec4 perpendicularityColor = mix(texel1, texel2, mixf);
      vec2 transitionPerturbation = perturbation * transitionValue;
      
      perpendicularityColor = mix(
        perpendicularityColor,
        vec4(252. * COLOR_CONV, 228. * COLOR_CONV, 124. * COLOR_CONV, 1.),
        smoothstep(4. * transitionValue + transitionPerturbation.y, 12. * transitionValue + transitionPerturbation.y, distance)
      );

      color = mix(
        color,
        perpendicularityColor,
        -smoothstep(10. * transitionValue + transitionPerturbation.x, 12. * transitionValue + transitionPerturbation.x, distance) + 1.
      );
    }

    gl_FragColor = mix(vec4(.0, .0, .0, 1.), color, -DimTransition * 0.5 + 1.0);
  }
`
