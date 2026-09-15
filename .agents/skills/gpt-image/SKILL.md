---
name: gpt-image
description: Generate a TeachBox100 cover in a new non-Work image-generation task when the user asks for a conversation-driven result rather than the project image script.
---

# GPT Image cover generator

Use this skill for a one-off TeachBox100 cover made through a new, projectless conversation. It is separate from `teachbox-cover-generator`, which uses the project image API script.

## Workflow

1. Create a new projectless task, not a ChatGPT Work task. Ask that task to use its built-in image-generation tool for the cover.
2. Give the task `public/images/mascot/barkley.webp` as the character reference. Attach a current warm cover only when it is needed to establish the family’s style.
3. Send one structured prompt that states the card’s visual moment, the strict palette and flat paper-cut rules from `scripts/gen-cover.py`, the Barkley silhouette requirements, 4:3 output, and no text.
4. When the requested delivery is transparent, explicitly require a true alpha-transparent PNG and use the built-in image-generation tool rather than the project script.
5. Inspect the returned image. For a correction, make one targeted follow-up that preserves the scene and changes only the failed requirement.
6. Save the selected asset under a new descriptive filename in `public/images/covers/warm/`. Do not replace an existing cover unless the user explicitly asks to update that cover; then update its `imageSrc` in `app/pages.config.ts` and add or update a focused test for that path.

## Current Ichiban Kuji direction

For the Ichiban Kuji ticket reveal, use a compact, happy hop: one hind paw just lifted, head angled toward the ticket, and both front paws presenting it at chest height. Keep Barkley’s canonical face unchanged. The ticket should have a sky-blue outer frame and a pale-yellow perforated reveal panel, modelled on a real tear-open prize ticket. Put a red apple with a green leaf on the reveal panel instead of a star. Keep the background genuinely transparent for PNG delivery.
