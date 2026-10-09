import * as THREE from 'three';

// A procedural "design prototype": a twisted, petalled vessel built layer by
// layer — exactly how an FDM printer builds things. Replace with a GLB later
// (see README) or keep it, it's ~4 KB of code instead of a 3D asset.

export const PROTOTYPE = { layers: 120, segments: 96, height: 2.1 };

/** Base radius profile along the object, t = 0 (bottom) → 1 (top). */
export function prototypeRadiusAt(t) {
  const body = 0.62 + 0.3 * Math.sin(t * Math.PI * 1.35 + 0.5);
  const edge = 0.045;
  const bottom = t < edge ? Math.sqrt(1 - Math.pow(1 - t / edge, 2)) : 1;
  const top = 1 - t < edge ? Math.sqrt(1 - Math.pow(1 - (1 - t) / edge, 2)) : 1;
  return body * Math.min(bottom, top);
}

export function createPrototypeGeometry({ layers, segments, height } = PROTOTYPE) {
  const cols = segments + 1; // duplicated seam column keeps UVs continuous
  const positions = new Float32Array((layers + 1) * cols * 3);
  const uvs = new Float32Array((layers + 1) * cols * 2);

  for (let i = 0; i <= layers; i++) {
    const t = i / layers;
    const radius = prototypeRadiusAt(t);
    const petalAmount = 0.06 + 0.06 * Math.sin(Math.PI * t);
    const twist = t * 3.4;
    for (let j = 0; j < cols; j++) {
      const a = (j / segments) * Math.PI * 2;
      const r = radius * (1 + petalAmount * Math.cos(5 * a + twist));
      const k = i * cols + j;
      positions[k * 3] = Math.cos(a) * r;
      positions[k * 3 + 1] = t * height - height / 2;
      positions[k * 3 + 2] = Math.sin(a) * r;
      uvs[k * 2] = j / segments;
      uvs[k * 2 + 1] = t;
    }
  }

  // Indices are ordered layer by layer so `setDrawRange` can "print" the object.
  const indices = new Uint16Array(layers * segments * 6);
  let n = 0;
  for (let i = 0; i < layers; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices[n++] = a;
      indices[n++] = c;
      indices[n++] = b;
      indices[n++] = b;
      indices[n++] = c;
      indices[n++] = d;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  // Average the normals across the duplicated seam so there's no visible line.
  const normals = geometry.attributes.normal;
  for (let i = 0; i <= layers; i++) {
    const first = i * cols;
    const last = first + segments;
    const nx = normals.getX(first) + normals.getX(last);
    const ny = normals.getY(first) + normals.getY(last);
    const nz = normals.getZ(first) + normals.getZ(last);
    const len = Math.hypot(nx, ny, nz) || 1;
    normals.setXYZ(first, nx / len, ny / len, nz / len);
    normals.setXYZ(last, nx / len, ny / len, nz / len);
  }
  normals.needsUpdate = true;
  geometry.computeBoundingSphere();
  return geometry;
}

/** Tiny repeating texture: one soft "bead" per printed layer → visible FDM layer lines. */
export function createLayerTexture(layers = PROTOTYPE.layers, maxAnisotropy = 4) {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < canvas.height; y++) {
    const v = 0.5 + 0.5 * Math.cos(((y + 0.5) / canvas.height) * Math.PI * 2);
    const g = Math.round(v * 255);
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, layers);
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/** Soft blob used as a contact shadow under the object. */
export function createShadowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(23,22,27,0.34)');
  grad.addColorStop(0.55, 'rgba(23,22,27,0.12)');
  grad.addColorStop(1, 'rgba(23,22,27,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
