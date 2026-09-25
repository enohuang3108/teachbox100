---
name: gpt-image
description: Generate a TeachBox100 cover in a new non-Work image-generation task when the user asks for a conversation-driven result rather than the project image script.
---

# GPT Image cover generator

Use this skill for a one-off TeachBox100 cover made through a new, projectless conversation. It is separate from `teachbox-cover-generator`, which uses the project image API script.

## Workflow

1. Create a new projectless task, not a ChatGPT Work task. Ask that task to use its built-in image-generation tool for the cover.
2. Give the task `public/images/mascot/barkley.webp` and `public/images/mascot/references/barkley-character-definition.png` as character references. Attach current warm covers when useful to establish the family’s style.
3. Send one structured prompt that states the card’s visual moment, the strict palette and flat paper-cut rules from `scripts/gen-cover.py`, the Barkley silhouette requirements, 4:3 output, and no text. Use the approved character definition as the source for Barkley’s one-head-tall body proportions.
4. Every generated cover must have a genuinely transparent background and be delivered as a PNG with an alpha channel. Explicitly require true alpha transparency and use the built-in image-generation tool rather than the project script. Do not accept a solid-color or checkerboard background as transparency.
5. Inspect the returned image. For a correction, make one targeted follow-up that preserves the scene and changes only the failed requirement.
6. Save the selected asset under a new descriptive filename in `public/images/covers/warm/`. Do not replace an existing cover unless the user explicitly asks to update that cover; then update its `imageSrc` in `app/pages.config.ts` and add or update a focused test for that path.

## Barkley character reference

The approved character definition is `public/images/mascot/references/barkley-character-definition.png`. Barkley is a compact, one-head-tall mascot: head height and body height are approximately 1:1. Keep his black silhouette, cream eyes, and centered pupils recognizable, while allowing his pupils/eye direction to look toward the scene’s focal object or in another pose-appropriate direction. His eyes do not need to look upward in every cover. Do not add a mouth, nose, eyebrows, collar, or fur details unless explicitly requested.

## Prompt archive

Keep a dated, append-only record of the full prompt for every generated cover in `public/images/mascot/references/cover-prompts.md`. Record the cover name, generation date, references supplied, full prompt, and any follow-up correction prompt. Preserve the actual prompt text rather than a summary so future covers can reuse it.

## Current Ichiban Kuji direction

For the Ichiban Kuji ticket reveal, use a compact, happy hop: one hind paw just lifted, head angled toward the ticket, and both front paws presenting it at chest height. Keep Barkley’s canonical face unchanged. The ticket should have a sky-blue outer frame and a pale-yellow perforated reveal panel, modelled on a real tear-open prize ticket. Put a red apple with a green leaf on the reveal panel instead of a star. Keep the background genuinely transparent for PNG delivery.
