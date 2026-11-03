---
name: crisp-technical-docs
description: Write concise, source-verified READMEs, developer guides and architecture notes for an existing codebase. Use for technical project documentation with working commands, screenshots and attribution.
---

# Crisp technical docs

Write for a reader opening the repository for the first time. Lead with what the project does and the shortest route to running it. Explain implementation only where it helps someone use, understand or change the project.

## Ground the document

- Read the package manifest, entry points, existing documentation and applicable repository instructions before writing. Verify commands, paths, prerequisites and current behavior against the code.
- Distinguish implemented features, tested behavior and known limitations. Do not turn an automated check into a claim of real-world accuracy or visual verification.
- Preserve license notices and source attribution. Link skills, plugins and libraries to their actual upstream projects; distinguish design guidance from shipped dependencies.

## Keep it useful and short

- Prefer a compact overview, quick start, a small visual gallery, essential behavior, a brief build explanation and verification commands. Adapt the structure to the requested document.
- Use concrete verbs, short paragraphs and tables for comparisons. Remove repeated feature lists, promotional language, development chronology and incidental implementation detail.
- Link to maintained source files or evidence records instead of duplicating their inventories. Retain limitations that affect how someone interprets or uses the output.
- Keep names, versions, controls and examples consistent with the current application. Do not invent deployment URLs, licenses, badges or compatibility claims.

## Show the real product

- Capture the running application or its own export. Do not substitute a generated mockup for a screenshot.
- For visual comparisons, keep camera, pose, framing and output size consistent. Record the theme and other settings needed to reproduce the images.
- Store images in the repository with descriptive names and alt text. Inspect the saved files for missing content, clipping and incorrect states.

## Verify the deliverable

Check local links, image dimensions and documented commands. Render or preview the document when tooling is available. Run only checks relevant to the edits; documentation-only changes do not require unrelated application tests. Report any unverified behavior plainly.
