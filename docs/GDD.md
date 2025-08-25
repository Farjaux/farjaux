# A Trip to the Moon — Game Design Document (GDD)

**Working title:** *farjaux presents: A Trip to the Moon*
**Game type:** 2D retro platformer (arcade-style, SMB1-inspired)
**Platform:** Browser-only (desktop + mobile web), no downloadable build
**Engine/Framework:** JavaScript + Phaser 3 (ES modules, Vite dev server & build)

---

## 1) Vision & Constraints

* **Creative goal:** Faithfully recreate iconic scenes from Georges Méliès’ 1902 film *Le Voyage dans la Lune* while playing like an early 8-bit platformer. Keep the whimsy, stage-like sets, and theatrical transitions.
* **Playable character:** **Farjaux** (single protagonist), an intrepid astronomer/explorer.
* **Constraints:**

  * Browser-playable only; no explicit download links.
  * Assets optimized for fast loads; target < 2 MB initial bundle, progressive scene loading.
  * Responsive canvas with fixed internal resolution and integer scaling.

---

## 2) Gameplay Pillars

1. **Simple, precise platforming** — Run/jump, stomp enemies, limited inertia (SMB1 feel).
2. **Cinematic set pieces** — Each level mirrors a film scene with theatrical backdrops and stage machinery.
3. **Arcade scoring** — Stars, time bonus, 1‑ups, high-score table.

---

## 3) Core Loop

**Explore → Collect stars → Avoid/defeat Selenites → Reach end flag or boss → Score tally → Next scene.**
(3–5 minutes per level; quick restarts.)

---

## 4) Controls

* **Keyboard (desktop):** Left/Right = move, Up/Space = jump, Down = drop through thin platforms, Enter = start/pause.
* **Touch (mobile):** On‑screen left/right + jump; optional swipe up to jump.

---

## 5) Player Mechanics

* **Movement:** SMB1‑like acceleration, friction, jump arc.
* **Stomp attack:** Jump on enemies to defeat them (bounce slightly).
* **Ladders/ropes (limited):** Only where the film shows stage props.
* **Damage model:** Small → hurt knockback; lose one life. Temporary invulnerability (1.2s).
* **Lives/Continue:** 3 lives; game over → title screen. (Optional: continue from latest scene with score reset.)

---

## 6) Scoring & HUD

* **Stars (coins analogue):** +100 each; 100 stars = +1 life.
* **Defeats:** Selenite chain combo: 100 → 200 → 400 → 800 → 1,000…
* **Time bonus:** Remaining time × 50 at level end.
* **HUD:** Score, Stars, Lives, Scene timer (300 seconds per scene), Scene label.

---

## 7) Power‑Ups (Film‑themed)

* **Telescope (speed boots):** +10% speed, +5% jump for 20s.
* **Umbrella (glide):** Hold jump to slow fall.
* **Moon Dust (invincible):** 8s invulnerability with sparkling trail.
* **Cannon Charge (1‑up):** Rare extra life.

---

## 8) Enemies & Hazards

* **Selenite (grunt):** Patrols, leaps toward player; 1 stomp to defeat (explodes in puff of smoke like stage effect).
* **Bat automaton:** Small flying arc patterns in caves.
* **Falling stalactites:** Telegraph shake → fall.
* **Steam jets / sparks:** In foundry/build scenes as timing hazards.
* **Boss: Selenite Chief:** 3 hits via stomp when stunned (telegraphed spear thrusts), classic pattern cycles.

---

## 9) Scene/Level Progression (True to Film)

**Scene 1 — The Astronomers’ Club (Tutorial):**

* Indoor set with telescopes, chalkboards, and drapery.
* Introduce movement/jump/stars.
* End flag at observatory balcony; cut to rocket plan.

**Scene 2 — The Foundry (Build the Capsule):**

* Conveyer platforms, steam pipes, suspended chains.
* Timing hazards; collect **Cannon Charge** 1‑up.
* Exit to launch site.

**Scene 3 — The Launch Cannon (Set Piece):**

* Short auto‑scroll segment leading into cannon.
* Player enters capsule; theatrical countdown; launch cutscene.

**Scene 4 — Lunar Surface Landing (The Moon’s Face):**

* Parallax backdrop of the moon’s visage; landing crater foreground.
* New enemy: Selenite appears; introduce stomp combat.
* Mid‑scene animation nod to rocket‑in‑eye (non‑gory, playful).

**Scene 5 — The Mushroom Forest:**

* Springy mushroom platforms, bounce mechanics; umbrella power‑up shines here.
* Hidden room with star stash.

**Scene 6 — The Selenite Caves (Boss):**

* Low‑light tileset with bats, falling stalactites; 2‑phase **Selenite Chief** boss.
* Defeat boss → escape sequence starts.

**Scene 7 — Escape & Return (Finale):**

* Chase back to capsule; timed auto‑scroll; jump aboard.
* Splashdown cutscene (ocean), parade epilogue with score roll‑up and medal for Farjaux.
* **Arcade loop:** roll credits → back to title; high‑score entry (initials).

---

## 10) Art Direction

* **Resolution:** Native 320×180 (16:9), scaled by integer factors (×3=960×540, ×4=1280×720).
* **Sprite size:** 16×16 base grid (player 16×24), tiles 16×16.
* **Style:** Pixel‑art inspired by film sets; theatrical flats, painted skies, visible stage machinery.
* **Palette:** Muted sepia + hand‑tinted accents (light pastels: teal, rose, mustard). Use a 32‑color master palette.
* **Animation:** Snappy 6–8 fps per anim; smear frames on jump and stomp.
* **UI:** Ornate title cards; intertitle‑style scene names.

**Notes on IP:** Méliès’ 1902 film is public domain in many jurisdictions. We’ll use **original pixel art** inspired by the film’s imagery (no direct frame lifts). Consider a credit: “Inspired by Georges Méliès’ *Le Voyage dans la Lune* (1902).”

---

## 11) Audio Direction

* **Music:** Public‑domain classical/vaudeville pieces or original chiptunes with music‑hall vibe.
* **SFX:** Cartridge‑like bleeps/boops (8‑bit style) with occasional stage‑fx samples (steam puff, crowd cheer).

---

## 12) Technical Stack

* **Engine:** Phaser 3 (latest stable)
* **Language:** Modern JS (ES2022+), TypeScript optional (recommended)
* **Bundler/dev:** Vite (ESM dev server; fast HMR)
* **Tiled maps:** `.tmx`/`.json` from **Tiled** editor (tile colliders via object layers)
* **Physics:** Arcade Physics (simple AABB), fixed time step
* **Fonts:** Bitmap fonts (BMFont / msdf) for crisp pixel UI

**Project structure**

```
farjaux/
  docs/
  public/                
  src/
    assets/
      audio/ sfx/ music/
      fonts/
      images/           
      tilesets/
      sprites/
      maps/
    scenes/
      BootScene.js
      PreloadScene.js
      TitleScene.js
      Scene1_Club.js
      Scene2_Foundry.js
      Scene3_Launch.js
      Scene4_Landing.js
      Scene5_Forest.js
      Scene6_CavesBoss.js
      Scene7_Return.js
      UIScene.js
    objects/
      Player.js
      EnemySelenite.js
      CollectibleStar.js
      Powerups.js
    config/
      constants.js
      phaserConfig.js
    main.js
  index.html
  vite.config.js
  package.json
  README.md
```
---

## 13) Performance & Mobile

* Lock physics step; cap to 60 FPS.
* Use spritesheets/atlases; texture packing.
* Lazy‑load later scenes via dynamic `import()` to keep initial payload small.
* Provide reduced‑effects mode for low‑end devices.

---

## 14) Deployment (farjaux.com)

* **Hosting:** Vercel, Netlify, or Cloudflare Pages → bind `farjaux.com` with HTTPS.
* **Branching:** `main` → production; `dev` → preview deploys.
* **No‑download stance:** Don’t provide downloadable builds. Note: web assets are inherently retrievable via dev tools; minimize by bundling, fingerprinting, and license notice.
* **Service Worker:** Cache‑first for assets, network‑first for scores; optional offline title screen.

---

## 15) Data & High Scores

* Local high‑scores (no account) using `localStorage`. Optional cloud board later using a lightweight serverless endpoint with basic tamper‑mitigation.

---

## 16) Milestones

1. **v0.1 Prototype (1–2 weeks):** Player controller, one tileset, stars, Selenite grunt, Scene 1 graybox, title → scene loop.
2. **v0.2 Content Pass:** Scenes 2–3 with set pieces (foundry hazards, launch).
3. **v0.3 Lunar Arc:** Scenes 4–6 with mushroom forest, caves, boss.
4. **v1.0 Polish:** Scene 7 finale, audio, UX polish, responsiveness, high scores, deploy to `farjaux.com`.

---

## 17) Asset Specs

* **Tileset:** 16×16 PNG, palette‑constrained; collision via Tiled object layers.
* **Player:** 16×24, anims (idle, run 6f, jump 2f, fall 2f, hurt 2f).
* **Selenite:** 16×24, walk 4f, leap 2f, puff death 3f.
* **UI bitmap font:** MSDF/bitmap at 8px cap height for crisp scaling.

---

## 18) Legal & Credits

* Credit Méliès + year; include link to background reading on film history (in‑game credits).
* All art/audio created new or from public domain/CC0 with attribution as required.

---

## 19) Next Steps (Actionable)

* Initialize repo with Vite + Phaser template.
* Add Title + Scene1 graybox and working player controller.
* Create first tileset (Astronomers’ Club) and a 50×14 tilemap.
* Implement stars, HUD, timer, and simple Selenite.
* Deploy preview to a subdomain (e.g., `dev.farjaux.com`).
