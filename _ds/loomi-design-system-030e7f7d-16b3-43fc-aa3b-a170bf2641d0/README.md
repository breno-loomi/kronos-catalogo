# Loomi Design System

A design system for **Loomi** — a young, bold, future-facing brand that co-creates solutions, possibilities, and futures, "de pixel a pixel, iluminando caminhos para algo maior."

> *"A identidade da Loomi é jovem e usa cortes fortes — o roxo, o rosa, o lilás —, mas com sobriedade. Majoritariamente, as cores sempre estão sobrepostas a branco ou preto. Co-criamos soluções. Co-criamos possibilidades. Co-criamos futuros. De pixel a pixel, iluminando caminhos para algo maior."*

---

## Sources

- **Figma:** *Loomi Design System.fig* (mounted virtual filesystem). Pages: Introdução, Type, Color, Logo, Base Conceitual, Vibes-Loomi, Planos, Assets, Stickers, Ícones, Imagens.
- **Uploaded files:** Sora font family (Thin/ExtraLight/Medium/SemiBold/ExtraBold + variable axis), `Logos.svg` (the four-cor logo set), `Icon Loomi.svg` (the lone "OO" icon).

---

## Index

| File / folder | What it is |
|---|---|
| `README.md` | This file — context, content rules, visual foundations, iconography. |
| `SKILL.md` | Agent-Skill manifest so this system can be loaded as a skill. |
| `colors_and_type.css` | Token CSS: variables for color, fonts, type scale, radii, shadows, spacing. |
| `fonts/` | Sora `.ttf` files (the only family Loomi uses). |
| `assets/` | Logos, icon, brand-graphic SVGs. |
| `preview/` | Card HTML files registered in the Design System tab. |
| `ui_kits/` | Per-product UI kits (currently a marketing-site kit). |

---

## CONTENT FUNDAMENTALS — voice & copy

**Language.** Brazilian Portuguese, with comfortable English code-switches when the concept is global ("across the full spectrum", "Light", "Pink scale"). Short sentences. Confident, never breathless.

**Person.** First-person plural ("nós") almost always — `Co-criamos soluções. Co-criamos possibilidades. Co-criamos futuros.` The brand acts as a collective. When addressing the reader, it's `você`, never `tu` or imperative pile-ons.

**Tone.** Sober optimism. The marketing copy on the Color page itself sets the rule: *"uma marca divertida, mas que também tem sua seriedade e foco no futuro."* Disruptive but never zany. Future-facing but never sci-fi cliché.

**Casing.**
- Body copy is **sentence case**.
- Eyebrows / labels / category tags are **lowercase or UPPERCASE with wide tracking** (`letter-spacing: 0.200em`). Never Title Case.
- Display headings are sentence case ("lorem ipsum dolor"), not capitalised.
- The wordmark is rendered "Loomi" (capital L, lowercase rest) — never LOOMI in running text.

**Vocabulary the brand uses.** *Co-criar. Pixel. Círculo. Fluxo contínuo. Across the full spectrum. Iluminar caminhos. Glassmorphism. Disruptiva. Convergência. Inovação. Transformação contínua.* These show up in real Figma copy — reuse them when in doubt.

**Anti-patterns.** No exclamation marks. No emoji (the brand has its own sticker / icon system instead — see Iconography). No salesy CTAs ("Click now!"). No hype adjectives ("revolutionary", "game-changing"). No em-dash-soup. No "we're on a mission to…".

**Examples lifted from the file.**
- *"A Sora é a fonte oficial para títulos e destaques textuais da Loomi. Sua forma sem serifas e arrojada traz um frescor e leveza aos visuais da Loomi."*
- *"As cores da Loomi são fortes e brilhantes e buscam ser disruptivas, assim como os projetos da empresa."*
- *"O Pixel estará presente em toda a identidade Loomi, sendo o alicerce visual para a coerência e coesão da empresa."*
- *"A junção do círculo e do pixel é uma metáfora visual forte para a inovação e transformação contínuas."*

---

## VISUAL FOUNDATIONS

### Color
Three primaries: **Purple `#5014BA`**, **Pink `#F63BB7`**, **Lilac `#C13AFF`**, plus a print-only **Luxus `#B2178C`**. Each has a 5-step scale (see `colors_and_type.css`). The rule: *primaries never live alone* — they sit on top of pure black (`#0C0912`) or pure white (`#F8F8F8`). Pink and Purple don't contrast well against each other, so secondary cuts (the Lilac scale, neutrals) are the bridge.

The brand defaults to **dark mode** — the conceptual base is `#0C0912` ("preto Loomi"), with `#F8F8F8` for foreground.

### Typography
**One family, Sora**, used across the entire system. Weights in active rotation: **Thin (100)** for hero/display, **ExtraLight (200)** and **Light (300)** for headings and body. Medium/SemiBold appear only when legibility demands ("para fins específicos onde a legibilidade pode ser difícil"). Letter-spacing is a consistent `-0.030em` on display and body; eyebrows go to `+0.200em` UPPERCASE.

### Spacing & layout
Loomi grids hard on **80px page padding, 60px section gaps, 40px sub-section gaps, 20px element gaps**. Inside cards, content sits in 30-pixel inset blocks. The result is calm, generous whitespace around dense type.

Fixed elements: a top-left page title (e.g. "Cores", "Tipografia") with a tiny `V.1.0` underneath; a top-right wordmark. Bottom-right reserved for stickers / decorative chips.

### Backgrounds
- **Solid black or solid white** is the default — full-bleed, no gradients underneath.
- **Glassmorphism panels** sit on top of imagery (a brand pillar, see *Base Conceitual* — "O glassmorphism traz uma sensação de fluidez, de camadas e de camuflagem"). Implemented as `backdrop-filter: blur(125px); background: rgba(255,255,255,0.01); border: 0.5px solid rgba(255,255,255,0.29)`.
- **Pixel grids** (32-cell rectangle clusters) appear as hero motifs, tying back to the "pixel é a fundação" thesis.
- No gradient backgrounds are used as the dominant background. Color *does* appear through **diamond / radial bleed effects** behind glass, but those are decoration, never the canvas.

### Imagery
Photography is **high-saturation, futurist, often portrait or texture-heavy** with strong directional light. Skin tones, neon-lit interiors, cosmic / volumetric pieces. Never grainy b&w. Imagery typically clipped into **rounded-rectangle masks** (`borderRadius: 20–30px`) or **circle masks**, often double-stacked behind a glass panel.

### Borders, shadows, depth
- **Hairline borders** at 0.5–1px in `rgba(248,248,248,0.20)` or `rgba(248,248,248,0.50)` — used to outline cards, dividers, and to wrap glass panels.
- **No drop shadows** on most surfaces; depth comes from blur + opacity instead.
- When a shadow is used (lift on focus, sticker bounce), it's a soft, diffuse glow tinted with the nearest brand colour: `0 0 60px rgba(80,20,186,0.55)`.
- Inner shadow / inset is rare. Loomi prefers borders + opacity.

### Corner radii
- Cards / hero panels: **20–30px**.
- Small inputs / chips: **5–12px**.
- Logo lockup container: **5px** with a dashed-violet outline — that's a Figma artefact, not a runtime style.
- Stickers and round badges: **fully circular**.

### Animation
The Figma file is static, but the conceptual brief is "fluxo contínuo, convergência" — that translates to:
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quart) by default. Smooth deceleration, never bouncy.
- **Durations:** 200ms for hovers, 350ms for state changes, 600ms+ for hero/morphing pieces.
- **No bounces.** No spring physics. Loomi is a **fade + glide** brand.
- Recommended motion patterns: opacity fades, light translateY, slow blur reductions on entry, glass panels easing into place.

### Hover & press states
- **Hover on neutral surfaces:** raise opacity of the border from 0.20 → 0.50, brighten foreground from `#F8F8F8` → pure `#FFFFFF`. No transform.
- **Hover on coloured CTAs:** desaturate ~6% (or step to the +1 scale stop, e.g. Purple-3 → Purple-2 going darker, or Purple-3 → Purple-4 going lighter, depending on context).
- **Press / active:** scale `0.98`, hold for the duration, no extra colour change.
- Disabled: 40% opacity.

### Transparency & blur
Used heavily — but always **purposefully**.
- Glass overlays for content cards on imagery.
- Soft white at 20–50% as borders.
- A 25% white shadow ring on stickers (a recurring Figma effect).
- Never blur "for fun" — it always sits on top of imagery or pixel grids to create the layered depth that's the brand's hallmark.

### Cards
A canonical Loomi card is:
```
border-radius: 20px;
background: rgba(255,255,255,0.04);
border: 1px solid rgba(248,248,248,0.20);
backdrop-filter: blur(32px);
padding: 30px 40px;  /* or 80px on hero panels */
```
No drop shadow. The card lifts via border-strength on hover.

### Layout fixed elements
1. Page title top-left, version sub-label below it.
2. Wordmark top-right.
3. Eyebrow text below cards (e.g. `display 1`, `taCABIXIGA 1`).
4. Sticker / chip art bottom-right or floating across the canvas.

---

## Components

The marketing UI kit (`ui_kits/marketing/`) exports six components:

- **Header** — top navigation bar with the Loomi wordmark, version sub-label, and link group.
- **Hero** — full-bleed pixel-grid hero section with a glassmorphism title card.
- **ManifestoCard** — the three-line "Co-criamos" mantra panel with supporting copy.
- **ColorShowcase** — presentation tile showing the three primary Loomi color cuts.
- **ProjectGrid** — three project cards using the glass-on-imagery composition.
- **Footer** — minimal footer with oversized wordmark, CTA line, and legal row.

---

## ICONOGRAPHY

Loomi uses **two parallel icon systems**, both stored in the Figma file under `/cones`:

1. **`/cones/Icons` — coloured-line illustrations.** ~28 SVGs covering finance / business concepts (Bank, Brainstorming, Investment, Profit, Coin, Customer, Analysis, Web Development, Growth, Idea, Start-Up, Meeting, Money Bag, Expense, Income, Loss, Trophy, Goal, Target, Support, Discussion, Teamwork, Lighthouse, etc). They're soft, slightly playful, outlined-with-fill style. Use these for editorial / marketing storytelling, **not** as UI affordances.
2. **`/cones/glyph` and `/cones/stroke` — placeholder folders** in this Figma export (each contains a 95-byte stub `index.jsx`). Loomi's intention is a future stroke-icon set; for product UI today, **substitute Lucide** (`https://unpkg.com/lucide@latest`) — its 1.5px stroke / 24px grid matches the Loomi vibe most closely. Flagged below.

**Stickers** (`/Stickers`) are a separate decorative layer — circular stamps, "love and trust" hand-lettering, an "L" mark — used as personality flourishes on social posts and presentation corners. They're branded artwork, not icons; copy them as-is, don't re-style.

**Emoji.** Not used. The brand has its own sticker system; that's the answer to "we want a playful flourish here".

**Unicode / dingbats.** Not used either.

**Logo set.** Six wordmark variants live in `assets/loomi-wordmark-set.svg` (Black, White, Purple, Pink, Lilac, Luxus) plus the standalone "OO" `loomi-icon.svg`. Always pick the colour that maximises contrast with the *adjacent* surface — primaries on black/white only.

### Substitution flags
- **Stroke / glyph icon set:** the Figma slots are empty. **Substituted with Lucide via CDN** for any UI-kit needs. *Please confirm the intended icon library, or upload the Loomi stroke set.*
- **Fonts:** all six requested Sora weights are present. ✅ No substitution.
- **Sticker artwork:** packed in the Figma file but not exported as standalone SVGs in this pass — the Stickers page contains complex compound shapes. *Tell me which stickers matter most and I'll copy them out individually.*

---

## CAVEATS & NEXT STEPS

See the bottom of this file in chat — every limitation is flagged for you to triage.
