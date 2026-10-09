import { pricing as defaultPricing } from '../data/pricing';

/**
 * Pure quote function. No React, no DOM — swap the body for a backend /
 * Bambu Studio slicing call later and keep the return shape.
 *
 * @param {object} input
 * @param {{volumeCm3:number|null, dimsMm:{x:number,y:number,z:number}|null}} input.analysis  geometry facts (or nulls)
 * @param {number} input.fileSizeBytes
 * @param {'standard'|'high'|'ultra'} input.quality
 * @param {number} input.quantity
 * @param {object} [config]  pricing table, defaults to data/pricing.js
 */
export function calculateQuote({ analysis, fileSizeBytes, quality, quantity }, config = defaultPricing) {
  const q = config.quality[quality] ?? config.quality.standard;
  const qty = Math.min(config.maxQuantity, Math.max(1, Math.floor(quantity) || 1));

  // 1. Weight of one part
  let isRough = false;
  let gramsPerPart;
  if (analysis?.volumeCm3) {
    const { densityGPerCm3, solidFraction } = config.material;
    gramsPerPart = analysis.volumeCm3 * densityGPerCm3 * solidFraction;
  } else {
    isRough = true;
    const f = config.fallback;
    const guess = (fileSizeBytes / 1024) * f.gramsPerKB;
    gramsPerPart = Math.min(f.maxGrams, Math.max(f.minGrams, guess));
  }
  gramsPerPart = Math.max(config.minGrams, Math.round(gramsPerPart));

  // 2. Price
  const discount = config.quantityDiscounts.find((d) => qty >= d.min)?.factor ?? 1;
  const materialPerPart = gramsPerPart * config.perGram * q.multiplier;
  const partsCost = materialPerPart * qty * discount;
  const raw = config.base + partsCost + config.handling;
  const price = Math.max(config.base + config.handling, Math.round(raw / config.roundTo) * config.roundTo);

  // 3. Time + delivery
  const minutesPerPart = (gramsPerPart / q.gramsPerHour) * 60;
  const efficiency = qty > 1 ? config.time.batchEfficiency : 1;
  const printMinutes = Math.round(minutesPerPart * qty * efficiency + config.time.warmupMinutes);
  const hours = printMinutes / 60;
  const deliveryLabel = config.delivery.find((d) => hours <= d.upToHours).label;

  // 4. Soft warnings
  const totalGrams = gramsPerPart * qty;
  const dims = analysis?.dimsMm;
  let tooBig = false;
  if (dims) {
    const model = [dims.x, dims.y, dims.z].sort((a, b) => b - a);
    const bed = [config.buildVolumeMm.x, config.buildVolumeMm.y, config.buildVolumeMm.z].sort((a, b) => b - a);
    tooBig = model.some((v, i) => v > bed[i]);
  }

  return { gramsPerPart, totalGrams, price, printMinutes, deliveryLabel, isRough, tooBig, quantity: qty };
}
