import * as THREE from 'three';

// Client-side file analysis. Nothing is uploaded — files are read in the browser.
//
// analyseFile(file) → {
//   kind: 'stl' | 'obj' | '3mf' | 'step' | 'sample',
//   geometry: THREE.BufferGeometry | null,   // centred, Y-up, for the preview
//   volumeCm3: number | null,                // used by the quote calculator
//   dimsMm: {x,y,z} | null,
//   previewAvailable: boolean,
// }
// STEP files can't be meshed in the browser without a heavy CAD kernel, so they
// return nulls and the quote falls back to a rough estimate from file size.

import { getExtension } from './fileTypes';

export async function analyseFile(file) {
  const ext = getExtension(file.name);
  try {
    if (ext === 'stl') return fromTriangles(parseSTL(await file.arrayBuffer()), 'stl');
    if (ext === 'obj') return fromTriangles(parseOBJ(await file.text()), 'obj');
    if (ext === '3mf') return fromTriangles(await parse3MF(await file.arrayBuffer()), '3mf');
  } catch (err) {
    console.warn('[Mood Sunday] Could not read geometry, falling back to a rough estimate.', err);
  }
  return { kind: ext === '3mf' || ext === 'stl' || ext === 'obj' ? ext : 'step', geometry: null, volumeCm3: null, dimsMm: null, previewAvailable: false };
}

/* ───────────── shared: triangles → analysis ───────────── */

function fromTriangles({ positions, unitScale = 1 }, kind) {
  if (!positions || positions.length < 9) throw new Error('No triangles found');
  if (unitScale !== 1) for (let i = 0; i < positions.length; i++) positions[i] *= unitScale;

  // Bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  let dims = { x: maxX - minX, y: maxY - minY, z: maxZ - minZ };

  // Heuristic: a model under 1 unit is almost certainly in metres → convert to mm.
  if (Math.max(dims.x, dims.y, dims.z) < 1) {
    for (let i = 0; i < positions.length; i++) positions[i] *= 1000;
    dims = { x: dims.x * 1000, y: dims.y * 1000, z: dims.z * 1000 };
  }

  // Signed volume (divergence theorem) in mm³ → cm³
  let vol = 0;
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i], ay = positions[i + 1], az = positions[i + 2];
    const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5];
    const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8];
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
  }
  let volumeCm3 = Math.abs(vol) / 1000;
  // Open / non-manifold meshes can give ~0 — fall back to a share of the bounding box.
  const boxCm3 = (dims.x * dims.y * dims.z) / 1000;
  if (!Number.isFinite(volumeCm3) || volumeCm3 < boxCm3 * 0.01) volumeCm3 = boxCm3 * 0.2;

  // Preview geometry: CAD is Z-up, three.js is Y-up.
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  geometry.center();
  geometry.computeBoundingBox();

  return { kind, geometry, volumeCm3, dimsMm: { x: dims.x, y: dims.z, z: dims.y }, previewAvailable: true };
}

/* ───────────── STL (binary + ASCII) ───────────── */

function parseSTL(buffer) {
  const view = new DataView(buffer);
  if (buffer.byteLength > 84) {
    const count = view.getUint32(80, true);
    if (84 + count * 50 === buffer.byteLength) {
      const positions = new Float32Array(count * 9);
      let o = 84;
      for (let t = 0; t < count; t++) {
        o += 12; // skip normal
        for (let k = 0; k < 9; k++, o += 4) positions[t * 9 + k] = view.getFloat32(o, true);
        o += 2; // attribute byte count
      }
      return { positions };
    }
  }
  // ASCII
  const text = new TextDecoder().decode(buffer);
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
  return { positions: new Float32Array(out) };
}

/* ───────────── OBJ ───────────── */

function parseOBJ(text) {
  const verts = [];
  const out = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('v ')) {
      const p = line.trim().split(/\s+/);
      verts.push(parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3]));
    } else if (line.startsWith('f ')) {
      const idx = line
        .trim()
        .split(/\s+/)
        .slice(1)
        .map((tok) => {
          const n = parseInt(tok.split('/')[0], 10);
          return n < 0 ? verts.length / 3 + n : n - 1;
        });
      for (let i = 1; i < idx.length - 1; i++) {
        for (const k of [idx[0], idx[i], idx[i + 1]]) out.push(verts[k * 3], verts[k * 3 + 1], verts[k * 3 + 2]);
      }
    }
  }
  return { positions: new Float32Array(out) };
}

/* ───────────── 3MF (zip of XML) ───────────── */

const UNIT_TO_MM = { micron: 0.001, millimeter: 1, centimeter: 10, inch: 25.4, foot: 304.8, meter: 1000 };

async function parse3MF(buffer) {
  if (typeof DecompressionStream === 'undefined') throw new Error('No DecompressionStream');
  const entries = readZipDirectory(buffer);
  const models = entries.filter((e) => /\.model$/i.test(e.name));
  if (!models.length) throw new Error('No model in 3MF');

  const out = [];
  let unitScale = 1;
  for (const entry of models) {
    const xml = new TextDecoder().decode(await inflateEntry(buffer, entry));
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const modelEl = doc.getElementsByTagName('model')[0];
    const unit = modelEl?.getAttribute('unit');
    if (unit && UNIT_TO_MM[unit]) unitScale = UNIT_TO_MM[unit];
    for (const mesh of doc.getElementsByTagName('mesh')) {
      const vEls = mesh.getElementsByTagName('vertex');
      const v = new Float32Array(vEls.length * 3);
      for (let i = 0; i < vEls.length; i++) {
        v[i * 3] = parseFloat(vEls[i].getAttribute('x'));
        v[i * 3 + 1] = parseFloat(vEls[i].getAttribute('y'));
        v[i * 3 + 2] = parseFloat(vEls[i].getAttribute('z'));
      }
      const tEls = mesh.getElementsByTagName('triangle');
      for (let i = 0; i < tEls.length; i++) {
        for (const attr of ['v1', 'v2', 'v3']) {
          const k = parseInt(tEls[i].getAttribute(attr), 10) * 3;
          out.push(v[k], v[k + 1], v[k + 2]);
        }
      }
    }
  }
  return { positions: new Float32Array(out), unitScale };
}

function readZipDirectory(buffer) {
  const dv = new DataView(buffer);
  let eocd = -1;
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a zip');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const compressedSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localOffset = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(new Uint8Array(buffer, p + 46, nameLen));
    entries.push({ name, method, compressedSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function inflateEntry(buffer, entry) {
  const dv = new DataView(buffer);
  const start = entry.localOffset + 30 + dv.getUint16(entry.localOffset + 26, true) + dv.getUint16(entry.localOffset + 28, true);
  const slice = buffer.slice(start, start + entry.compressedSize);
  if (entry.method === 0) return slice;
  const stream = new Blob([slice]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).arrayBuffer();
}
