---
name: frontend-design-hard-rules
description: Frontend design constraints: one composition, brand-first, no generic AI layouts, motion, and existing-system exception.
---
# Frontend design hard rules

When doing frontend design tasks, avoid generic, overbuilt layouts.

Hard rules:
- One composition: first viewport reads as one composition, not a dashboard (unless it is a dashboard).
- Brand first: on branded pages, brand/product name is a hero-level signal, not just nav text. No headline should overpower the brand. Brand test: if the first viewport could belong to another brand after removing the nav, branding is too weak.
- Typography: expressive, purposeful fonts; avoid default stacks (Inter, Roboto, Arial, system).
- Background: do not rely on flat single-color backgrounds; use gradients, images, or subtle patterns.
- Full-bleed hero only on landing/promotional surfaces: dominant edge-to-edge visual. No inset heroes, side-panel heroes, rounded media cards, tiled collages, or floating image blocks unless the existing design system requires it.
- Hero budget: usually only brand, one headline, one short supporting sentence, one CTA group, one dominant image. No stats, schedules, listings, address blocks, promos, or secondary marketing in the first viewport.
- No hero overlays: no detached labels, floating badges, promo stickers, info chips, or callout boxes on hero media.
- Cards: default no cards. Never in the hero. Cards only when they containerise a user interaction. If removing border/shadow/background/radius does not hurt interaction or understanding, it should not be a card.
- One job per section: one purpose, one headline, usually one short supporting sentence.
- Real visual anchor: imagery shows product/place/atmosphere/context. Decorative gradients alone do not count as the main visual idea.
- Reduce clutter: avoid pill clusters, stat strips, icon rows, boxed promos, schedule snippets, competing text blocks.
- Motion: at least 2-3 intentional motions for visually led work; presence and hierarchy, not noise.
- Color and look: choose a clear direction with CSS variables. Avoid common AI-default looks: purple-on-white / purple-to-indigo gradients; warm cream (~#F4F1EA) with high-contrast serif + terracotta; broadsheet hairline rules / zero radius / dense newspaper columns. Avoid biases to dark mode, purple, glow, rounded-full pills, multi-layer shadows, emojis.
- Must work on desktop and mobile.
- React: prefer modern patterns (useEffectEvent, startTransition, useDeferredValue) when appropriate for the team. Do not add useMemo/useCallback by default unless already used; follow the repo React Compiler guidance.

Exception: within an existing website or design system, preserve established patterns and visual language.