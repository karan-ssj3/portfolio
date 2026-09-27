import * as THREE from 'three'

/**
 * Deep Layers shaders
 *
 * Edge and pulse programs for the propagation and backprop waves. Both read
 * the same per-vertex attributes (aLayer, aInitW, aTargetW, aEdgeT), so the
 * Points object can reuse the edge geometry without extra buffers.
 */

export const COLORS = {
  base: '#FFFFEB',
  forward: '#FFA946',
  back: '#FFBCF2',
  noise: '#FF6C4C',
}

// Output colour-space conversion. The chunk was renamed in r154, so pick the
// one this Three build ships. It keeps palette hexes exact both when drawing
// straight to the canvas and when Bloom renders through a linear target.
const OUTPUT_CHUNK = THREE.ShaderChunk.colorspace_fragment
  ? '#include <colorspace_fragment>'
  : '#include <encodings_fragment>'

const COMMON = /* glsl */ `
  float epochT(float epoch) {
    return clamp(epoch / 40.0, 0.0, 1.0);
  }

  float displayedWeight(float initW, float targetW, float t) {
    return mix(initW, targetW, 1.0 - pow(1.0 - t, 3.0));
  }

  // Written as 1 - smoothstep(0, 0.06, d): GLSL leaves edge0 > edge1 undefined.
  float band(float phase, float head) {
    return 1.0 - smoothstep(0.0, 0.06, abs(phase - head));
  }

  // A sweep parked at 0 or 1 is idle, so its band stays dark.
  float sweepGate(float head) {
    return step(0.0001, head) * step(head, 0.9999);
  }

  // Gaussian pointer falloff on the input plane (sigma 0.6).
  float pointerFalloff(vec2 p, vec2 pointer) {
    float d = distance(p, pointer);
    return exp(-(d * d) / 0.72);
  }
`

export const edgeVertex = /* glsl */ `
  uniform float uTime;
  uniform float uEpoch;
  uniform vec2 uPointer;
  uniform float uPointerActive;

  attribute float aLayer;
  attribute float aInitW;
  attribute float aTargetW;
  attribute float aEdgeT;

  varying float vW;
  varying float vPhase;
  varying float vNoise;
  varying float vPointer;

  ${COMMON}

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    float t = epochT(uEpoch);
    vW = displayedWeight(aInitW, aTargetW, t);
    vPhase = (aLayer + aEdgeT) / 5.0;
    vNoise = hash(position + floor(uTime * 8.0));

    float isInput = 1.0 - step(0.5, aLayer);
    vPointer = uPointerActive * isInput * (1.0 - aEdgeT) * pointerFalloff(position.xy, uPointer);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const edgeFragment = /* glsl */ `
  uniform float uEpoch;
  uniform float uForward;
  uniform float uBackward;
  uniform vec3 uColorBase;
  uniform vec3 uColorForward;
  uniform vec3 uColorBack;
  uniform vec3 uColorNoise;

  varying float vW;
  varying float vPhase;
  varying float vNoise;
  varying float vPointer;

  ${COMMON}

  void main() {
    float t = epochT(uEpoch);
    float w = vW;

    // Base weight alpha; weak edges prune toward 0.03 late in training.
    float alpha = 0.04 + 0.5 * w;
    float prune = smoothstep(0.6, 1.0, t) * (1.0 - smoothstep(0.15, 0.4, w));
    alpha = mix(alpha, 0.03, prune);

    vec3 color = uColorBase * alpha;

    // Forward pass (amber) and backprop wave (pink).
    float forward = band(vPhase, uForward) * sweepGate(uForward);
    float backward = band(vPhase, 1.0 - uBackward) * sweepGate(uBackward);
    color += uColorForward * forward * w;
    color += uColorBack * backward * w;

    // Early training noise: coral flicker that fades out by t = 0.25.
    if (t < 0.25) {
      color += uColorNoise * vNoise * (0.25 - t) * 2.0 * 0.6;
    }

    // Pointer drawing on the input layer.
    color += uColorForward * vPointer * 0.5;

    gl_FragColor = vec4(color, 1.0);
    ${OUTPUT_CHUNK}
  }
`

export const pulseVertex = /* glsl */ `
  uniform float uEpoch;
  uniform float uForward;
  uniform float uDpr;
  uniform vec2 uPointer;
  uniform float uPointerActive;

  attribute float aLayer;
  attribute float aInitW;
  attribute float aTargetW;
  attribute float aEdgeT;

  varying float vGlow;

  ${COMMON}

  void main() {
    float t = epochT(uEpoch);
    float w = displayedWeight(aInitW, aTargetW, t);
    float phase = (aLayer + aEdgeT) / 5.0;
    float b = band(phase, uForward) * sweepGate(uForward);

    // Pointer injects extra pulses at input-layer source vertices.
    float isInputSource = (1.0 - step(0.5, aLayer)) * (1.0 - step(0.5, aEdgeT));
    b = max(b, uPointerActive * isInputSource * pointerFalloff(position.xy, uPointer));

    vGlow = b;
    gl_PointSize = (3.0 + 5.0 * w) * b * uDpr;

    if (b <= 0.001) {
      // Push inactive points outside the clip volume.
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    } else {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  }
`

export const pulseFragment = /* glsl */ `
  uniform vec3 uColorForward;

  varying float vGlow;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5 || vGlow <= 0.001) discard;

    float soft = 1.0 - smoothstep(0.3, 0.5, r);
    gl_FragColor = vec4(uColorForward * soft * vGlow * 0.45, 1.0);
    ${OUTPUT_CHUNK}
  }
`

/**
 * One uniforms object shared by the edge and pulse materials, so a single
 * write per frame drives both programs.
 */
export function makeUniforms() {
  return {
    uTime: { value: 0 },
    uEpoch: { value: 0 },
    uForward: { value: 0 },
    uBackward: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPointerActive: { value: 0 },
    uDpr: { value: 1 },
    uColorBase: { value: new THREE.Color(COLORS.base) },
    uColorForward: { value: new THREE.Color(COLORS.forward) },
    uColorBack: { value: new THREE.Color(COLORS.back) },
    uColorNoise: { value: new THREE.Color(COLORS.noise) },
  }
}
