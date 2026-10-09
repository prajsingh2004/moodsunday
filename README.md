# Mood Sunday — moodsunday.com

3D printing in Bandra, Mumbai. **You make it. We print it.**
React + Vite + Three.js. No UI library, no backend.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the build locally
```

Needs Node 20+.

## What works today

| Feature | Notes |
|---|---|
| Hero object | Procedural FDM-style vessel with visible layer lines. "Prints" itself in over ~2.6 s on load, then slowly rotates. Reacts to cursor and to scroll (rotation, camera lift, vertical drift, headline drift). |
| Upload | Click, drag-and-drop, validation, loading / success / error states, replace, remove. **Nothing is uploaded.** Files are read in the browser. |
| Real file analysis | STL (binary + ASCII), OBJ and 3MF are parsed in the browser → real volume, real dimensions, live 3D preview in your chosen colour. STEP/STP can't be meshed in a browser, so they get a rough estimate from file size and a "no preview" tile. |
| "Try a sample" | Lets anyone try the flow without a file. |
| Quote | Colour, quality, quantity → weight, print time, delivery, price. Numbers tween. Labelled "Estimated quote", never an invoice. |
| Print this | Native `<dialog>` summary → WhatsApp message with file name, colour, quality, quantity, price, time and delivery. Also a Call button. No fake order, no fake payment. |
| WhatsApp / call | `https://wa.me/918910262089`, `tel:+918910262089`. Desktop floating pill, mobile bottom bar (WhatsApp + Call). |

## Things you'll want to edit

| File | What |
|---|---|
| `src/data/pricing.js` | **All pricing numbers**: base, ₹/gram, quality multipliers, discounts, print speeds, delivery bands, build volume. Placeholder values, set your own. |
| `src/data/contact.js` | Phone, WhatsApp number, location, **Instagram** (set `url` + `handle` and it appears everywhere). |
| `src/data/colours.js` | PLA colours (name + hex). |
| `src/styles/global.css` | Colour tokens (`--paper`, `--ink`, `--accent`), type, spacing. |
| `index.html` | Title, description, Open Graph, JSON-LD. |
| `public/images/og.png` | **Placeholder** share image (1200×630). Replace with a real one. |
| `public/favicon/` | Placeholder favicon set. |

## How the quote works

`src/utils/quoteCalculator.js` is a pure function: `calculateQuote({ analysis, fileSizeBytes, quality, quantity }, config)`.

1. Weight = model volume × PLA density × `solidFraction` (share that ends up as plastic: walls + infill).
2. Price = `base + (grams × perGram × qualityMultiplier × qty × batchDiscount) + handling`, rounded to ₹10.
3. Time = grams ÷ quality print speed, with a small batch efficiency and warm-up.
4. Delivery = band by total print hours.

To connect a real system later (Bambu Studio slicing, an API, Firebase, Razorpay/Stripe), replace the body of `calculateQuote` and keep the return shape: `{ gramsPerPart, totalGrams, price, printMinutes, deliveryLabel, isRough, tooBig }`. The UI doesn't care where the numbers come from. `src/utils/whatsapp.js` builds the message; `src/hooks/useFileUpload.js` is where an actual upload would go.

## Project structure

```
src/
  components/    Navbar, Hero, QuoteSection, FileUpload, ColourPicker, QuoteConfigurator,
                 QuoteCard, OrderDialog, PrinterSection, ColourSection, Process, Local,
                 Contact, Footer, WhatsAppButton, Viewer (+ lazy PrintViewer), ui/
  context/       PrintContext (shared colour)
  data/          pricing, colours, contact
  hooks/         useFileUpload, useTweenedNumber, useReveal
  three/         prototype.js (procedural object, layer texture, shadow)
  utils/         quoteCalculator, whatsapp, parse3d (STL/OBJ/3MF), format, scrollStore, motion
  styles/        global.css (each component has its own .css next to it)
public/          favicon, images, models, robots.txt, sitemap.xml
```

## Performance notes

- Three.js is code-split and **lazy-loaded**; the first-load JS is ~79 kB gzipped. The 3D chunk loads right after.
- The 3D loop pauses when the canvas is off-screen or the tab is hidden. Pixel ratio is capped (1.5 on touch devices).
- `prefers-reduced-motion`: no print-in, no idle rotation, no scroll drift, no reveal animations. The scene renders statically.
- If WebGL is unavailable, a CSS layered-stack silhouette is shown instead.
- No videos, no images in the hero, no 3D asset to download. The object is generated in code.

## Swapping the hero object for your own GLB

The hero is procedural so it ships with zero assets. To use a real model, put a compressed `.glb` in `public/models/`, load it with `GLTFLoader` in `src/components/PrintViewer.jsx`, and pass its first mesh's geometry to `api.setGeometry(...)`. Keep it under ~1 MB (Draco / meshopt). The layer-line texture only applies to the procedural object.

## Deploying to moodsunday.com

It's a static site. `npm run build`, then upload `dist/` to Netlify, Vercel, Cloudflare Pages or any static host, and point the domain at it. The site is a single page, so no rewrite rules are needed.

## Before you launch, check these

- [ ] Replace placeholder pricing in `pricing.js` with your real numbers.
- [ ] Set the real printer build volume in `pricing.js` (`buildVolumeMm`). It's a placeholder used only for a soft "looks big" note.
- [ ] Add your Instagram in `contact.js`.
- [ ] Replace `og.png` and the favicons.
- [ ] The printer illustration is a stylised drawing, not the manufacturer's artwork. Swap in a real photo of your machine when you have one.
- [ ] Test a few real STL / 3MF files from your own customers (3MF from Bambu Studio is parsed by reading every mesh in the file).

## Known limits (by design, for a front-end prototype)

- Estimates assume models are in millimetres (models under 1 unit are treated as metres).
- STL/OBJ/3MF are parsed on the main thread, so very large files (100 MB) may freeze the tab for a moment.
- 3MF parsing uses the browser's `DecompressionStream` (all current browsers). If it fails, the quote falls back to a rough size-based estimate.
