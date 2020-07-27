// language=GLSL
export default `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define ALPHA .65
  #define PI 3.141592653589793

  float threshold = 0.1;

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

  float wave(float maxGrad, float value, float threshold, float opacity) {
    float waveDist = abs(value - threshold / 255. - 0.5);
    float aa = maxGrad / 24.;

    return 1. - smoothstep(aa + 1. / 255., 0., waveDist) / (1. + .5 * maxGrad) * opacity;
  }

  float blendColorDodge(float base, float blend) {
    return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
  }
  
  vec3 blendColorDodge(vec3 base, vec3 blend) {
    return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
  }
  
  vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
    return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
  }

  float blendColorBurn(float base, float blend) {
    return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
  }
  
  vec3 blendColorBurn(vec3 base, vec3 blend) {
    return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
  }
  
  vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
    return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
  }

  vec4 Sample(sampler2D bg, float borders, float waveDir, vec2 vUv, float maxGrad) {
    vec3 outlines = texture2D(OutlineTexture, vUv).rgb;
    float aa = maxGrad / 24.;

    vec3 col = texture2D(bg, vUv).rgb;

    float outline = outlines.r - .5;
    col *= 1. - smoothstep(aa + 0.5 / 255., 0., outline) / (1. + .5 * maxGrad) * 0.6;

    float waves = outlines.g;
    col *= wave(maxGrad, waves, waveDir * 12., 0.35) * wave(maxGrad, waves, waveDir * 22., 0.25) * wave(maxGrad, waves, waveDir * 32., 0.15);

    float borderSdf = outlines.b - .5;

    float borderDodge = smoothstep(aa + 37. / 255., 5.55 / 255., borderSdf) * borders;
    if (borderDodge > .0) {
      col = blendColorDodge(col, vec3(1., 1., 100. / 255.), 0.3 * borderDodge);
    }

    float borderBurn = smoothstep(aa + 5. / 255., 0., borderSdf) * borders;
    if (borderBurn > .0) {
      col = blendColorBurn(col, vec3(0.32, 0.32, 0.32), borderBurn);
    }

    float borderFactor = smoothstep(aa + 20. / 255., 0., borderSdf + 0.05) * borders;
    col = mix(col, vec3(178. / 255., 1. / 255., 1. / 255.), borderFactor);

    return vec4(col, 1);
  }
  
  vec2 perturbations(float t) {
    return vec2(
      0.5 * (sin(t) + cos(3.3 * t) + sin(0.7 * t)) + sin(4. * Time + t) * 0.5,
      0.5 * (sin(0.9 * t + 2.) + cos(3.3 * 0.9 * t + 1.) + sin(0.7 * 0.9 * t + 1.5)) + sin(3. * Time + t) * 0.7
    );
  }

  void main() {
    highp vec2 maxGrad2 = fwidth(vUv * vec2(1024, 512));
    highp float maxGrad = max(maxGrad2.x, maxGrad2.y);

    vec4 texel1 = Sample(BgTexture, 1., 1., vUv, maxGrad);
    vec4 texel2 = Sample(ShadesmarBgTexture, 0., -1., vUv, maxGrad);

    vec4 transitionTexel = texture2D(TransitionTexture, vUv);
    float r = Transition * (1.0 + threshold * 2.0) - threshold;
    float mixf = clamp((transitionTexel.r - r) * (1.0 / threshold), 0.0, 1.0);
    
    vec4 color = mix(texel1, texel2, 1.0 - mixf);

    if (PerpTransition > 0.) {
      vec2 mapPos = (vUv * vec2(1024, 512) - vec2(512, 256)) - PerpLocation;

      float angle = atan(mapPos.x, mapPos.y);
      vec2 perturbation = perturbations(PerpPeriod * angle);

      if (angle < -3.05 || angle > 3.05) {
        vec2 leftPerturbation = perturbations(PerpPeriod * 3.05);
        vec2 rightPerturbation = perturbations(PerpPeriod * -3.05);
        perturbation = mix(leftPerturbation, rightPerturbation, smoothstep(0., PI - 3.05, mod(angle + 2. * PI, 2. * PI) - 3.05));
      }
      
      float transitionValue = smoothstep(0.0, 1.0, PerpTransition);
      
      vec4 perpendicularityColor = mix(texel1, texel2, mixf);
      
      float distance = length(mapPos);

      perpendicularityColor = mix(
        perpendicularityColor,
        vec4(252. / 255., 228. / 255., 124. / 255., 1.),
        smoothstep((10.0 + perturbation.y - 6.0) * transitionValue, (10.0 + perturbation.y + 2.) * transitionValue, distance)
      );

      color = mix(
        color,
        perpendicularityColor,
        (1. - smoothstep((10.0 + perturbation.x) * transitionValue, (10.0 + perturbation.x + 2.) * transitionValue, distance))
      );
    }

    gl_FragColor = mix(vec4(.0, .0, .0, 1.), color, .5 + .5 * (1. - DimTransition));
  }
`
