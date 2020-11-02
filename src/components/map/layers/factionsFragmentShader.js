// language=GLSL
export default `
  #ifdef GL_ES
  precision highp float;
  #endif

  varying vec2 vUv;

  uniform sampler2D Texture;
  uniform float Progress;
  uniform float Time;

  const int OCTAVES = 4;
  const float INTENSITY = 2.;

  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9818, 79.279)))*43758.5453123);
  }

  vec2 random2(vec2 st){
    st = vec2(dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43759.34517123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // smootstep
    vec2 u = f*f*(3.0-2.0*f);

    return mix(mix(dot(random2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
    dot(random2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(random2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
    dot(random2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
  }

  float fractal_brownian_motion(vec2 coord) { 
    float value = 0.0;
    float scale = 0.5;
    for (int i = 0; i < 2; i++) { 
      value += noise(coord) * scale;
      coord *= 2.0;
      scale *= 0.5;
    }
    return value + 0.25;
  }

  void main() {
    vec3 base = texture2D(Texture, vUv).rgb;
    vec2 pos = vec2(vUv * 8.0);
    vec2 motion = vec2(fractal_brownian_motion(vec2(Time * 0.3) + pos));
    float factor = fractal_brownian_motion(pos + motion) * INTENSITY;

    vec3 mixed = mix(vec3(.0, .0, .0), vec3(239. / 255., 187. / 255., 21. / 255.), base.r * factor); // Odium
    mixed = mix(mixed, vec3(35. / 255., 211. / 255., 156. / 255.), base.g  * factor); // Neutral
    float total = floor(vUv.x * 256.) + floor(vUv.y * 128.);
    vec3 coalitionColor = mix(vec3(32. / 255., 137. / 255., 227. / 255.), vec3(136. / 255., 67. / 255., 19. / 255.), mod(total, 2.0));
    mixed = mix(mixed, coalitionColor, base.b * (factor + 0.1)); // Coalition
    
    gl_FragColor = vec4(mixed * Progress, 0.8 * factor * max(base.r, max(base.g, base.b)) * Progress);
  }
`
