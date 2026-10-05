# TASK: Full visual redesign of "Pose Please" (webcam meme-pose party game)

Do NOT touch game logic, MediaPipe pose detection, room/socket logic, scoring, or routing. This is a VISUAL-LAYER-ONLY redesign: styles, markup structure for presentation, SVG assets, and animations.

Read and follow /SKILL.md (taste skill) first. Where it conflicts with this brief, THIS brief wins for visual decisions (concept, palette, fonts, ornaments).

## 0. WHY (the problem)
The current UI reads as generic AI-generated SaaS: rounded geometric sans (Outfit-like), blue primary, white cards with 24px radius and soft shadows, pill chips everywhere, "icon-in-rounded-square + title + subtitle" feature cards, neon-glow stick figure on black. Tiny faint HUD labels (CAM_01, 60 FPS, MEDIAPIPE_AI) in the margins feel pasted on. Nothing has a point of view. Fix that.

## 1. CONCEPT: "PHOTOBOOTH NIGHT"
The game is an analog photobooth / disposable-camera party. Everything should feel like a printed photo strip, contact sheet, and flash-lit viewfinder, not a software dashboard.
- The page is warm paper, not white.
- Cards are physical objects: photo prints (white border, thicker bottom edge), strips, stickers, tape, ticket stubs, label-maker tape.
- The webcam area is a VIEWFINDER, not a rounded card.
- Tone: loud, playful, slightly chaotic, but with a strict grid underneath so it feels designed, not messy.

## 2. HARD BANS (never do these)
- No blue-to-purple or any gradient backgrounds, no gradient avatars, no gradient buttons.
- No glassmorphism / backdrop-blur cards.
- No neon glow, no outer glow, no "cyber" look, no dark-navy radial vignette.
- No uniform border-radius everywhere. Use a mix: 0px (sharp), 4px, and full pill only for very specific things. No 24px+ rounded white cards.
- No soft diffuse drop shadows. Use hard offset shadows only (e.g. 6px 6px 0 ink) or none.
- No "icon in rounded square + title + subtitle" card pattern. No lucide-style icon rows as decoration.
- No Inter, Outfit, Poppins, Roboto, Geist, DM Sans, Plus Jakarta, or system-ui defaults.
- No emoji as UI icons. No stock icon packs as ornaments.
- No tiny pale-gray monospace microcopy as decoration. Any HUD text must be functional or big enough to matter.
- No centered-everything symmetric layout. Use deliberate asymmetry, overlap, rotation (−3° to +3°), cropping off the viewport edge.
- No placeholder-looking gray "Menunggu" empty slots with dashed borders. Empty slots should look like empty photo-strip frames.

## 3. DESIGN TOKENS (define as CSS variables / Tailwind theme, use ONLY these)
Colors (flat, high contrast, limited):
--paper:      #EFE6D2   (page background, warm cream)
--paper-2:    #E4D8BE   (secondary surface, subtle)
--ink:        #14110F   (text, borders, shadows. Never pure #000)
--flash:      #FFD93B   (flash yellow: primary highlight, CTA, timer)
--signal:     #FF4A1C   (tomato red: REC dot, countdown, warnings, accent)
--lens:       #2B3FD6   (deep cobalt: used VERY sparingly, one or two spots only: lens ring, host crown tag)
--mint:       #7ED9A6   (success / "pose matched" only)
--white-print:#FFFDF6   (photo-print white, never #FFF)
Rules: ink + paper cover ~80% of any screen. Flash yellow is the hero accent. Signal red appears in tiny, sharp doses. Cobalt max once per screen. Contrast text/background ≥ 7:1 for body.

Borders: 2.5px solid var(--ink) on all primary objects. Hard shadow: 6px 6px 0 var(--ink); pressed state: translate(4px,4px) + shadow 2px 2px 0.
Radius: --r-sharp 0, --r-sm 4px, --r-pill 999px (only for buttons and the room-code tag). Viewfinder corners are SQUARE.
Texture: global film-grain overlay (SVG feTurbulence noise, opacity ~0.07, mix-blend multiply, pointer-events none) + very subtle halftone dot pattern on --paper-2 areas.

## 4. TYPOGRAPHY
Display / headings: "Bricolage Grotesque" (800, use the opsz/wdth axes: condensed-ish and tight for big titles). Huge, tight tracking (-0.03em), line-height 0.9. Title "Pose Please" should be enormous (clamp 72px to 180px) and may be partially overlapped by a sticker or tape.
Body: "Instrument Sans" 400/500/600, 16-18px, line-height 1.5.
Labels / HUD / data: "JetBrains Mono" 500, UPPERCASE, letter-spacing 0.08em, min 12px, ink color (not pale gray).
Accent (rare, max 1-2 per screen, rotated, on tape/sticker): "Caveat Brush" or "Permanent Marker" for handwritten annotations like "ayo gaya!" or "1 DETIK!".
Countdown / score numbers: Bricolage Grotesque 800 at 160-320px, with tabular numerals.
Load via next/font. Define a scale: 12 / 14 / 16 / 20 / 28 / 44 / 72 / 120 / 200.
Keep all UI copy in Indonesian. Rewrite stiff copy to be playful and short (e.g. "Bagikan kode ini ke teman..." becomes "Kasih kode ini ke temen, biar bisa nimbrung.").

## 5. BACKGROUND CAMERA ORNAMENTS (the main missing piece)
Build these as custom inline SVG (not icon library), drawn in --ink line art 2.5px with occasional flat fills of --flash / --signal. They sit BEHIND content (z-index below cards), large, cropped by the viewport edge, low-key but unmistakable:
a) GIANT CAMERA BODY: an oversized vintage rangefinder/instant camera (lens barrel, viewfinder window, shutter button, flash unit, strap lugs) occupying roughly 50-70% of viewport width, bleeding off the bottom-right on landing/lobby, rotated about -8°. Outline only with a few flat color blocks (yellow flash unit, red shutter button). Opacity 100% but sitting behind the content with paper-colored cards overlapping it.
b) LENS RINGS: concentric circles + aperture blade polygon (6-8 blades) as a huge decorative element behind the top-left, partially cropped, slow rotation (60s linear loop) on the blades only. Include engraved tick marks and tiny mono text on the ring like "F/1.8  1/125  ISO 400" (decorative but legible at 12px+).
c) FILM STRIP: vertical film strip with sprocket holes running down one edge of the page (replacing the current side rails), with 3-4 empty frames, one of them containing a tiny pose silhouette. It scrolls slowly (translateY loop) on lobby, static during gameplay.
d) FLOATING DEBRIS (sparingly, 5-8 items, various sizes, parallax on mouse move 4-12px): crossed viewfinder reticle, a torn photo corner, a camera flash starburst (flat yellow, 8-point), a roll of film canister, masking-tape strips, a hand-drawn arrow, stars/sparkles drawn as sharp 4-point shapes.
e) Replace corner brackets/side rails with a full-viewport VIEWFINDER FRAME: 4 thick L-shaped corner marks (6px, ink) inset 24px, center crosshair ticks at the 4 edge midpoints, small "REC ●" (red dot blinking, 1s) top-left, battery/exposure bar top-right, and a thin horizontal exposure-meter scale at the bottom with a moving needle. Keep it pointer-events none and behind interactive UI.
Everything must stay out of the way on mobile (hide b, d; shrink a to 40% width).

## 6. SCREEN-BY-SCREEN

### 6.1 Landing ( / )
- Left: massive "Pose Please" wordmark, two lines max ("POSE / PLEASE"), second word in outlined stroke text or on a --flash highlighter band, slight rotation. Subtitle in body font, max 2 lines.
- Replace the 7 feature/pose cards with: one horizontal contact-sheet strip of 4 example poses (Y-Pose, Dab Hero, The Thinker, Disco King) as photo-print frames with hand-drawn flat silhouettes inside (thick ink figure, no glow), each tilted differently, with the pose name on label-maker tape under it. The three tiny feature blurbs ("Kamera Instan", "Pose Seru", "Podium Juara") become one line of mono text under the strip, not cards.
- Right: the join panel is a TICKET STUB / photobooth coin slot panel: Player name input styled like a typewriter label (mono, underline only, no pill input), avatar = square photo-print with initials (flat color choice among --flash, --signal, --lens, --mint, --paper-2, no gradients). "Buat Room Baru" = big --flash button with ink border, hard shadow, arrow, press animation. "atau gabung kode" divider as perforated line (dashed circles). Code input = 4 separate boxy character cells.
- Sound toggle = small square button with ink border, speaker glyph drawn custom.

### 6.2 Lobby
- Room code "KCYH" is the hero: giant (160px+) letters, each letter in its own photo-booth "frame" cell, jittered rotation ±2°. "Salin Kode" = sticker button.
- Player list = a vertical PHOTO STRIP (4-5 frames stacked) like a real booth strip. Filled slot = avatar print with name and host crown as a cobalt tag. Empty slot = empty frame with a faint crosshair and mono "KOSONG". Remove "Menunggu" text and dashed boxes.
- Game settings = a camera-dial panel: rounds selector (3 / 5 / 8) as a rotary-dial-like segmented control with hard-edged selected state (ink fill + flash text), not a gray pill toggle. Solo mode = chunky mechanical toggle switch (square, ink, with click animation).
- Info warning box: yellow tape label with slightly rotated text, no rounded alert box with icon.
- "Mulai Permainan" disabled state = flat paper-2 with ink strikethrough-ish diagonal hatch, enabled state = --flash with shutter-icon wiggle.

### 6.3 Pose reveal / countdown (the screen in the screenshot)
- Layout becomes asymmetric: left 60% = TARGET POSE as a large Polaroid on a slight tilt with tape at the top; right 40% = status stack.
- Target pose figure: bold flat silhouette (ink body, thick limbs, round head), joint points as clean dots (use --signal / --flash / --mint only to mark accuracy zones: upper/mid/lower). NO glow, NO dark background, NO lollipop figure. Show half-body crop guide lines (the game scores upper half-body only) as dashed viewfinder guides.
- Pose name "Pose Santai (Netral)" as big display text on label tape under the print; "POSE NETRAL" tag becomes a stamped rubber-stamp (rotated -6°, double border, ink-red).
- Round indicator "Ronde 1/5" = film-frame counter ("FRAME 01/05" in mono with sprocket edge), not a pill.
- Current player "Player_9" = name tag sticker ("HALO, NAMAKU" style badge, flat color).
- Countdown "Mulai dalam 1s": gigantic numeral (200px+) in --signal, with squash-and-stretch pop animation each second and a camera-flash white flicker on 0.
- Remove the eye-in-rounded-square icon, empty-looking big white right card, and long centered paragraphs.

### 6.4 Active turn (webcam live)
- Webcam feed inside a VIEWFINDER: square corners, thick ink border, corner brackets, center reticle, rule-of-thirds grid lines (very light), REC dot + mono timer top-left, ISO/f-stop decorative readout bottom. Mirror the video. Overlay the target pose as a semi-transparent ink outline (not neon).
- 5-second turn timer as a film-roll countdown bar (sprocket-hole segments depleting) or big numeral, plus a 1-second "HOLD!" ring when pose is matched: mint flash + shutter click animation + "KLIK!" handwritten sticker.
- Live accuracy: horizontal exposure-meter with a needle, not a rounded progress bar.

### 6.5 Results / Podium
- Podium as stacked photo prints of each player's best captured frame (if available) on a wooden/paper podium made of simple flat blocks (1st tallest, flash yellow; 2nd paper-2; 3rd signal), with rubber-stamp ranks ("JUARA 1" rotated).
- Scores in huge display numerals, accuracy % in mono.
- Confetti = flat paper squares and stars (no glow), brief.
- "Main Lagi" button same style as primary CTA.

## 7. MOTION (CSS or Framer Motion, keep it snappy)
- Easing: cubic-bezier(.2,.9,.2,1.1) for pop; 120-200ms for hovers; max 500ms for entrances.
- Page load: elements "develop" like prints: stagger fade + slight rotate settle (opacity 0, rotate ±4° to final), 60ms stagger.
- Buttons: hover lifts shadow (6px to 8px), active presses (translate 4px,4px, shadow 2px).
- Capture event: full-screen white flash overlay (opacity 0 to 0.9 to 0 in 220ms) + tiny screen shake (2px) + shutter sound hook (existing sound system, don't add new libraries).
- Ambient: aperture blades rotate slowly, REC dot blinks, film strip drifts, floating debris parallax on mousemove.
- Respect prefers-reduced-motion: disable ambient, shake, parallax; keep only opacity transitions.

## 8. LAYOUT & RESPONSIVE
- 12-column grid, 1280 max content width, but ornaments may bleed full-bleed.
- Intentional overlaps: cards overlap ornaments by 24-60px; stickers overlap card corners.
- Mobile (<768px): single column, viewfinder frame inset 12px, title scales down with clamp(), photo strip becomes horizontal scroll with snap, hide heavy ornaments.
- Touch targets ≥ 48px. Focus states: 3px --lens outline offset 3px (visible, not removed).

## 9. IMPLEMENTATION RULES
- Create /styles/tokens.css (or tailwind theme extension) first; no hard-coded colors elsewhere.
- Create reusable components: <PhotoPrint>, <TapeLabel>, <Sticker>, <Stamp>, <Viewfinder>, <FilmStrip>, <ApertureRing>, <CameraBodyArt>, <ExposureMeter>, <HardButton>, <Ticket>, <GrainOverlay>. Put SVG art in /components/art/.
- Draw all SVG by hand with simple geometric primitives (rects, circles, paths); keep each under ~150 lines and optimized; use currentColor/CSS vars so they theme.
- Do not add heavy dependencies. Framer Motion is OK if already installed; otherwise CSS only.
- Keep Lighthouse accessibility ≥ 95: alt/aria for decorative SVG (aria-hidden), real button/label semantics, color is never the only signal.

## 10. PROCESS
1. First, list in 8-10 bullets what you will change per screen and the exact fonts/colors you chose (confirm they match this brief).
2. Implement tokens + fonts + global grain/viewfinder frame.
3. Build ornament SVG components.
4. Redo screens in order: Landing, Lobby, Reveal/Countdown, Active turn, Results.
5. Final pass: compare each screen against the HARD BANS list in section 2 and fix anything that violates it. Report which items you checked.
6. Deliver screenshots or a short summary of files touched. Do not change game logic.