---
name: teachbox-cover-generator
description: Generate or redraw a TeachBox100 lesson or game card cover with the project’s flat risograph Barkley style. Use when the user asks for a TeachBox cover image, cover concept, or a new cover variant; do not use for product photography or general site imagery.
---

# TeachBox cover generator

Generate project cover art through `scripts/gen-cover.py`. The script sends the scene prompt and `public/images/mascot/barkley.webp` to the configured image model, then saves a normalized 1024×768 WebP cover under `public/images/covers/warm/`.

## Workflow

1. Decide the cover’s single visual moment before writing a scene. The primary prop and the mascot’s two-paw action must remain recognizable in a thumbnail.
2. Add a short, scene-specific entry to `SCENES` in `scripts/gen-cover.py`. Keep the common style, palette, canvas, and Barkley rules in that script as the single source of truth.
3. Use a new descriptive scene key for a variant. Reuse an existing key only when the user explicitly asks to replace that cover.
4. Run `python3 scripts/gen-cover.py <scene-key>` from the repository root. This is an external image-generation request, so run it only when the user has asked for the cover generation.
5. Inspect `public/images/covers/warm/<scene-key>.webp`. If it misses one essential scene rule, revise only that rule and generate one further version with a new key.

## Ichiban Kuji

Use `ichiban-ticket-reveal` for the ticket-draw concept selected in this conversation. Its defining visual is a physical prize ticket being drawn from a ticket box and turned toward the viewer, with the red winner star printed on the ticket. Preserve this distinction from a capsule, crank, or receipt machine.
