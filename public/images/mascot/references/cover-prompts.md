# TeachBox100 cover prompt archive

Append one entry per generated cover. Preserve the full initial prompt and every follow-up correction prompt verbatim.

## 2026-09-23 — Barkley character definition (reference image)

- Purpose: Establish the approved one-head-tall Barkley proportions before generating the Morse code cover.
- Source image: `/Users/huai/.codex/generated_images/01a0ce97-12b0-7eb2-8120-73978fd70920/exec-103fd7b6-7f2b-4eed-96c7-aaa962aa037b.png`
- References supplied: `public/images/covers/warm/quiz-territory.webp` (territory battle), `public/images/covers/warm/clock-current-time.webp` (telling time), `public/images/covers/warm/monopoly.webp` (Monopoly), `public/images/mascot/barkley.webp`.
- Prompt: The complete generation prompt for this image was issued in the separate “阿黃角色定義圖” task and is not available in this workspace transcript as a saved prompt artifact. Future image tasks must append their exact prompts here at generation time.
- Approved guidance from user: Head height and body height approximately 1:1 (one-head-tall). Eye direction can vary with the scene and does not always need to point upward. All cover images must have a genuinely transparent background.

## 2026-09-25 — 終極密碼封面（gpt-image）

- Task: `01a0d425-af5d-7130-acf4-135560e6baa8`
- References supplied: `public/images/mascot/barkley.webp`, `public/images/mascot/references/barkley-character-definition.png`, `public/images/covers/warm/quiz-territory.webp`, `public/images/covers/warm/morse.webp`.
- Initial prompt:

```text
Create one finished TeachBox100 cover illustration for the “Ultimate Password” classroom guessing game. Use your built-in image-generation tool. Return the generated image and its local PNG path. Do not use scripts/gen-cover.py or any project image script.

Character references (read and supply BOTH to image generation):
- /Users/huai/side_project/teachbox100/public/images/mascot/barkley.webp
- /Users/huai/side_project/teachbox100/public/images/mascot/references/barkley-character-definition.png
Style reference (read and supply when useful):
- /Users/huai/side_project/teachbox100/public/images/covers/warm/quiz-territory.webp
- /Users/huai/side_project/teachbox100/public/images/covers/warm/morse.webp

Visual moment: Barkley has just cracked the secret. At centre-left, one large chunky GOLD padlock has sprung open: the U-shaped shackle clearly lifted away from the body. Two simple BLUE and RED solid paper-cut range markers face each other from left and right, closing toward the lock and leaving a narrow empty gap around it, visually showing the guessing range narrowing. Barkley stands on the right, compact and joyful, one front paw reaching toward the opened lock and the other slightly raised in a small victory gesture. Keep a clear transparent gap between his arms and torso. Keep his full body and ears inside the frame. The padlock and Barkley must be the two unmistakable subjects at thumbnail size. Avoid a keypad, clock, bomb, safe door, extra characters, and any text or numbers.

Barkley must match the approved character definition: compact one-head-tall proportions, head height and body height approximately 1:1, recognizable pure black #0D0D0D silhouette, two cream eyes with round centered black pupils. Eye direction may look toward the lock. No mouth, nose, eyebrows, collar, fur lines, or extra face details.

Exact flat risograph paper-cut family style: every object is ONE SOLID FLAT SHAPE with details knocked out; chunky slightly hand-drawn edges; subtle print grain only inside filled shapes. No outlines, strokes, gradients, shadows, 3D, highlights, glow, glossy effects, or complex texture. Strict palette only: cream #F8F0E3, white #FFFFFF, black #0D0D0D, red #CB2108, green #2C5427, gold #F8B003, blue #02569B. Use only the colors needed for this scene.

Output: landscape 4:3 composition, ideally 1024×768. NO TEXT, NO NUMBERS, NO LETTERS anywhere. Generous empty margin around the objects. CRITICAL: deliver a PNG with a genuinely transparent alpha-channel background (RGBA); the empty canvas outside the illustration must have alpha 0. Do not render a cream, white, solid-color, or checkerboard background. Do not fake transparency with a painted pattern.
```

## 2026-09-30 — 首頁主視覺「打開教具箱」（gpt-image，claude-design-v1）

- Purpose: Home hero for the Paper Toolbox redesign. The PNG is split into seven layers (box + six tools) under `public/images/home/toolbox/` so each tool can pop out of the box separately.
- Generated via: `codex exec` projectless task (built-in image generation), prompt on stdin.
- References supplied: `public/images/mascot/barkley.webp`, `public/images/mascot/references/barkley-character-definition.png`, `public/images/covers/warm/monopoly.webp` (style).
- Prompt:

```text
Create ONE finished illustration using your built-in image-generation tool. If you do NOT have an image generation tool, reply exactly NO_IMAGE_TOOL. Do not hand-write SVG and do not draw with PIL/ImageMagick. Save the result as a PNG file named hero-toolbox.png in the current working directory and print its absolute path.

Character references (supply BOTH to image generation): ref-barkley.png and ref-def.png (the approved one-head-tall character definition). Style reference: ref-style.png (existing cover family). Do NOT copy any pose from the references; pose him as described below.

Visual moment — "Open the TeachBox": A wide, chunky, flat paper-cut TOOLBOX sits at the bottom centre, drawn as a low trapezoid box body in GOLD #F8B003 with a simple black #0D0D0D handle bar, its RED #CB2108 lid flipped fully open backwards. Barkley the black dog mascot pops up OUT of the open box from behind the front wall, visible from the chest up, both front paws resting on the front rim of the box, head tilted slightly, eyes looking up-right toward the flying objects with delight. Around and above the box, classroom tools are springing out in a loose joyful arc (clearly separated from each other and from Barkley, each small but readable at thumbnail size):
- a round lottery spinner wheel with 6 alternating RED and GOLD wedges and a small black pointer,
- a cream analog wall clock with a thick black rim and two black hands (no numerals),
- one large GOLD coin with a cream ring knocked out (no digits),
- a white dice cube showing black pips,
- a BLUE #02569B stopwatch with a cream face and a single red hand,
- a small GREEN #2C5427 paper-cut star.
Composition: square-ish landscape 4:3; the box + Barkley occupy the lower-middle 55%; the tools fan out across the upper part; generous empty margin all around. Nothing cropped by the frame.

Barkley must match the approved character definition: compact one-head-tall proportions, head height and body height approximately 1:1, recognizable pure black #0D0D0D silhouette with two floppy ears, two cream eyes with round black pupils (pupils may look up-right toward the tools). No mouth, nose, eyebrows, collar, fur lines, or extra face details.

Exact flat risograph paper-cut family style: every object is ONE SOLID FLAT SHAPE with details knocked out; chunky slightly hand-drawn edges; subtle print grain only inside filled shapes. No outlines, strokes, gradients, shadows, 3D, highlights, glow, glossy effects, or complex texture. Strict palette only: cream #F8F0E3, white #FFFFFF, black #0D0D0D, red #CB2108, green #2C5427, gold #F8B003, blue #02569B.

Output: NO TEXT, NO NUMBERS, NO LETTERS anywhere. CRITICAL: deliver a PNG with a genuinely transparent alpha-channel background (RGBA); the empty canvas outside the illustration must have alpha 0. Do not render a cream, white, solid-color, or checkerboard background. Do not fake transparency with a painted pattern.
```

### 2026-09-30 — follow-up correction（box read as a sofa）

- References supplied: previous output as `prev-hero.png`, `public/images/mascot/barkley.webp`, `public/images/mascot/references/barkley-character-definition.png`, `public/images/covers/warm/monopoly.webp`.
- Result accepted on the first try; re-sliced into the same seven layers.
- Prompt:

```text
Create ONE finished illustration using your built-in image-generation tool. If you do NOT have an image generation tool, reply exactly NO_IMAGE_TOOL. Do not hand-write SVG and do not draw with PIL/ImageMagick. Save the result as a PNG file named hero-toolbox-v2.png in the current working directory and print its absolute path.

References: prev-hero.png is the previous version of THIS SAME illustration — keep its overall composition, its arc of six flying classroom tools (spinner wheel, wall clock, gold coin, dice, blue stopwatch, green star) in the same places and style. ref-barkley.png and ref-def.png define the mascot Barkley. ref-style.png is the flat risograph paper-cut family style.

THE ONE CHANGE: in prev-hero.png the box reads like a sofa (a red cushion back and a yellow couch base with a black bar). Redraw the box so it is an UNMISTAKABLE open TOOLBOX, recognizable even as a 200px thumbnail:
- a classic metal toolbox seen in 3/4 front view, body in GOLD #F8B003, slightly wider at the top than the bottom is NOT required — use a clean rectangular box body with a visible top rim;
- the RED #CB2108 hinged lid is swung open BEHIND the box and tilted back, clearly thinner than the body, joined to the back edge by a visible black hinge line;
- a black carry handle (an arched bar with two small feet) mounted on top of the open lid;
- two small black rectangular latches on the front face just under the rim;
- inside the rim, a cantilever tray: a shallow cream #F8F0E3 tray with two small dividers, lifted slightly up and forward on two thin black arms;
- NO black bar/mouth shape in the middle of the front face; the front face is plain gold except the two latches.
Barkley pops up out of the toolbox behind the tray, visible from the chest up, both front paws resting on the FRONT RIM of the box, looking up-right at the flying tools with delight.

Barkley must keep his canonical head from the references: compact one-head-tall proportions, pure black #0D0D0D silhouette, a clear SNOUT BUMP in 3/4 profile pointing to one side, ONE EAR UP AND CURLED at the tip and the OTHER EAR FLOPPED DOWN, two cream eyes with round black pupils (pupils looking up-right). No mouth, nose, eyebrows, collar, fur lines, or extra face details.

Exact flat risograph paper-cut family style: every object is ONE SOLID FLAT SHAPE with details knocked out; chunky slightly hand-drawn edges; subtle print grain only inside filled shapes. No outlines, strokes, gradients, shadows, 3D shading, highlights, glow, glossy effects, or complex texture. Strict palette only: cream #F8F0E3, white #FFFFFF, black #0D0D0D, red #CB2108, green #2C5427, gold #F8B003, blue #02569B.

Composition: landscape 4:3; toolbox + Barkley in the lower-middle; the tools fan out in an arc above; every tool clearly separated from each other and from the box/Barkley by transparent gaps; generous empty margin; nothing cropped.

Output: NO TEXT, NO NUMBERS, NO LETTERS anywhere. CRITICAL: deliver a PNG with a genuinely transparent alpha-channel background (RGBA); the empty canvas outside the illustration must have alpha 0. Do not render a cream, white, solid-color, or checkerboard background.
```

### 2026-10-01 — closed toolbox（點擊開箱的起始畫面）

- Reference supplied: `public/images/home/toolbox/box.webp` as `ref-open-box.png`.
- 首頁實際用的是切層後的圖（都對齊 904×700）：開箱原圖切成 `lid-open`（箱蓋＋提把，往下補到箱口）、`back`（箱內壁）、`tray`（托盤＋支架）、`barkley`、`front`（金色正面，開關兩態共用）、`paws`；被阿黃擋住的箱蓋、托盤與爪子壓住的金色是逐列內插補畫的。這張關箱圖只取箱蓋，補掉扣環缺口後存成 `lid-closed`，底邊貼齊 `front` 的箱口（y=444）。
- Prompt:

```text
Create ONE finished illustration using your built-in image-generation tool. If you do NOT have an image generation tool, reply exactly NO_IMAGE_TOOL. Do not hand-write SVG and do not draw with PIL/ImageMagick. Save the result as a PNG file named closed-box.png in the current working directory. Only copy the exact file path returned by this image_gen call; never pick "the newest file" with find or ls -t. Print its absolute path.

Reference: ref-open-box.png shows a gold toolbox that is OPEN, with a black dog popping out.

Draw THE SAME TOOLBOX, but CLOSED and EMPTY (no dog, nothing sticking out):
- the gold #F8B003 body must be IDENTICAL to the reference: same trapezoid shape (wider at the bottom), same proportions, same flat front face, same two small black rectangular latches, same chunky slightly hand-drawn edges and subtle print grain;
- on top of the body sits the RED #CB2108 lid, CLOSED: a low, slightly rounded red slab exactly as wide as the top rim of the gold body, about one fifth of the body's height, flush on the rim; the two black latches clip from the body up onto the lower edge of the lid;
- a black carry handle (an arched bar with two small feet), the same as in the reference, mounted on the middle of the closed lid's top;
- same straight-on front view as the reference.

Exact flat risograph paper-cut style: every object is ONE SOLID FLAT SHAPE; chunky slightly hand-drawn edges; subtle print grain only inside filled shapes. No outlines, strokes, gradients, shadows, 3D shading, highlights, glow. Strict palette: black #0D0D0D, red #CB2108, gold #F8B003.

Composition: landscape, the closed toolbox centered, generous empty margin, nothing cropped.

Output: NO TEXT anywhere. CRITICAL: deliver a PNG with a genuinely transparent alpha-channel background (RGBA); the canvas outside the toolbox must have alpha 0. No cream, white, solid or checkerboard background.
```
