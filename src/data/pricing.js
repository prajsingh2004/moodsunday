// ─────────────────────────────────────────────────────────────
// PLACEHOLDER PRICING — tune these numbers freely.
// Everything the quote calculator uses lives in this one object,
// so connecting a real slicer / API later only means replacing
// the calculator, not the UI.
// ─────────────────────────────────────────────────────────────
export const pricing = {
  currency: 'INR',

  base: 150, // flat cost per order (₹)
  perGram: 3.5, // material + machine time per gram (₹)
  handling: 50, // packing / handling per order (₹)
  roundTo: 10, // final price is rounded to the nearest ₹10
  minGrams: 3, // never quote less than this per part

  quality: {
    standard: { label: 'Standard', multiplier: 1.0, gramsPerHour: 30 },
    high: { label: 'High', multiplier: 1.25, gramsPerHour: 20 },
    ultra: { label: 'Ultra', multiplier: 1.5, gramsPerHour: 12 },
  },

  // Bigger batches get a small discount on the per-part cost.
  quantityDiscounts: [
    { min: 10, factor: 0.85 },
    { min: 5, factor: 0.92 },
  ],

  material: {
    name: 'PLA',
    densityGPerCm3: 1.24,
    // Share of the model's solid volume that ends up as plastic (walls + infill).
    solidFraction: 0.32,
  },

  // Used when we can't read the file's geometry (STEP, unreadable 3MF…).
  fallback: { gramsPerKB: 0.14, minGrams: 12, maxGrams: 400 },

  time: {
    warmupMinutes: 10,
    batchEfficiency: 0.92, // multiple copies print slightly faster each
  },

  // Delivery label by total print hours.
  delivery: [
    { upToHours: 8, label: '1–2 days' },
    { upToHours: 24, label: '2–3 days' },
    { upToHours: 72, label: '3–5 days' },
    { upToHours: Infinity, label: '5–7 days' },
  ],

  // Soft warnings only — we confirm on WhatsApp either way.
  buildVolumeMm: { x: 256, y: 256, z: 256 }, // placeholder, update to your printer's real volume
  maxQuantity: 50,
  maxFileBytes: 100 * 1024 * 1024,
};

export const qualityOrder = ['standard', 'high', 'ultra'];
