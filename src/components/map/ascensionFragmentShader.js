// language=GLSL
export default `
uniform sampler2D BgTexture;
uniform sampler2D TransitionTexture;
uniform float Progress;
uniform float Time;
uniform vec2 Epicenter;
uniform float Transition;

varying vec2 vUv;

const vec2 CENTER = vec2(0.5, 0.5);

// Noise Function
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec3 terrain = texture2D(BgTexture, vUv).rgb;
  float luminance = dot(terrain, vec3(0.299, 0.587, 0.114));
  float emissionMask = 1.0 - luminance;
  
  vec2 toEpicenter = vUv - Epicenter;
  float distFromEpicenter = length(toEpicenter);
  
  vec2 toCenter = vUv - CENTER;
  float dist = length(toCenter);
  
  float smokeAlpha = 0.0;
  
  // PHASE 1: Rising Smoke (0.0 - 0.45)
  if (Progress > 0.0 && Progress < 0.45) {
    float mistProgress = clamp(Progress / 0.15, 0.0, 1.0);
    
    // Noise
    float turbulence = noise(vUv * 8.0 + Time * 0.5);
    turbulence += noise(vUv * 16.0 + Time * 0.7) * 0.5;
    turbulence /= 1.5;
    
    smokeAlpha = emissionMask * 2.0;
    smokeAlpha *= (turbulence * 0.5 + 0.5);
    smokeAlpha *= smoothstep(0.0, 0.5, mistProgress);
    smokeAlpha = clamp(smokeAlpha * 1.5, 0.0, 1.0);
  }
  
  // PHASE 2: Shockwave for cognitive ripples (0.35 - 0.5)
  float shockwaveIntensity = 0.0;
  if (Progress > 0.35 && Progress < 0.5) {
    float expProgress = (Progress - 0.35) / 0.15;
    float shockwaveRadius = expProgress * 1.5;
    
    // Clear smoke inside shockwave
    float insideShockwave = step(distFromEpicenter, shockwaveRadius * 0.92);
    smokeAlpha *= (1.0 - insideShockwave);
    
    // Simple expanding ring with glow
    float rimDist = abs(distFromEpicenter - shockwaveRadius);
    float shockwaveRing = smoothstep(0.02, 0.0, rimDist);
    
    // Inner glow
    float innerGlow = 0.0;
    if (distFromEpicenter < shockwaveRadius) {
      float distFromRim = shockwaveRadius - distFromEpicenter;
      innerGlow = exp(-distFromRim * 5.0) * 0.5;
    }
    
    // Epicenter glow
    float epicenterGlow = smoothstep(0.12, 0.0, distFromEpicenter) * (1.0 - expProgress * 0.5);
    
    shockwaveIntensity = shockwaveRing * 2.0 + innerGlow + epicenterGlow * 0.8;
  }
  
  // PHASE 3: Golden overlay (0.5 - 0.95)
  vec3 goldOverlay = vec3(0.0);
  if (Progress > 0.5 && Progress < 0.95) {
    float fadeProgress = (Progress - 0.5) / 0.45; 
    vec3 gold = vec3(1.0, 0.65, 0.0);
    
    float overlayIntensity = (1.0 - fadeProgress) * 0.25;
    float epicenterInfluence = smoothstep(0.8, 0.0, dist);
    overlayIntensity += epicenterInfluence * (1.0 - fadeProgress) * 0.15;
    
    // Mask to physical realm only
    vec4 transitionTexel = texture2D(TransitionTexture, vUv);
    float r = Transition * 1.2 - 0.1;
    float mixf = clamp((transitionTexel.r - r) * 10.0, 0.0, 1.0);
    overlayIntensity *= mixf;
    
    goldOverlay = gold * overlayIntensity;
  }
  
  // All Effects
  vec3 smokeColor = vec3(0.0);
  vec3 whiteShockwave = vec3(1.0) * shockwaveIntensity;
  
  float smokeStrength = clamp(smokeAlpha * 0.85, 0.0, 1.0);
  float explosionAlpha = clamp(shockwaveIntensity * 0.8, 0.0, 1.0);
  float goldOverlayAlpha = clamp(length(goldOverlay) * 0.35, 0.0, 1.0);
  
  vec3 finalColor = smokeColor * smokeStrength + whiteShockwave + goldOverlay;
  float finalAlpha = smokeStrength + explosionAlpha + goldOverlayAlpha;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
`
