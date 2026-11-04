# 0001 The face package

Date: 2026-11-05
Status: accepted for 0.1.0, two items open below.

## Context

The v1.0 plan puts the animated Moby face and shared components in `moby-ui`, used by `moby-desktop` and `moby-web`. The face today lives in `moby-desktop/src/face/` (inline SVG plus CSS in `src/styles.css`). `moby-web` has only a decorative, non-animated robot made of `div`s and no expressions. The expression list comes from `moby-protocol`; ADR 0001 in `moby-desktop` says to use a sibling `file:` dependency until the first protocol tag exists.

## Decisions

1. **Draw the face as inline SVG, animate with CSS only.** Alternatives: canvas (no CSS theming, no accessibility tree, needs a `requestAnimationFrame` loop to clean up), a JS timer for blinking (leaks on unmount, needs reduced-motion logic in two places), a Lottie or video asset (external binary, no theming). SVG plus CSS keeps the component stateless, so there are no timers to leak and `prefers-reduced-motion` is one media query. It also needs no inline `style` attributes, which matters for the desktop app's strict CSP.
2. **Ship a separate `styles.css`, imported by the consumer.** Alternatives: inject a `<style>` tag at runtime (blocked by the desktop CSP, pollutes `document.head`), CSS-in-JS (extra dependency), inline every style (cannot theme or use keyframes). Everything in the file is under `.moby-face`, `moby-face-*` keyframes, or `--moby-face-*` properties.
3. **Theme with tokens the library never declares.** The CSS only reads `var(--moby-face-x, default)`, so an ancestor can set `--moby-face-screen`, `--moby-face-bezel`, `--moby-face-warning`, `--moby-face-glow`, and `--moby-face-mood-<expression>` without specificity fights. Light and dark use `light-dark()`; the `theme` prop forces one. The screen stays black in both themes, like the robot's OLED. Cost: Chromium 123, Firefox 120, Safari 17.5 or newer. The desktop app runs on evergreen WebView2.
4. **Vite library mode (ESM) plus `tsc` for declarations.** Alternative: tsup or `vite-plugin-dts`. Vite is already the toolchain of both consumers, and `tsc --emitDeclarationOnly` avoids another dependency. React and the JSX runtime are external, `sideEffects` is false, and the `exports` map lists only the entry, `styles.css`, and `package.json`.
5. **Protocol types as a peer dependency, types only.** `@mobyuz/moby-protocol` is imported with `import type`, so nothing from it reaches the bundle. The dev dependency is `file:../moby-protocol` and CI checks out and builds the protocol `main` next to this repo, as `moby-desktop` does. A test compares the face's expression list to the protocol's runtime `EXPRESSIONS`, and `Record<Expression, ...>` fails type checking if a value is added or removed.
6. **Unknown expressions draw as `error`.** The firmware does the same (`moby_face_render`), so a bad value looks the same on both faces and never throws.
7. **`private: true` stays until the owner decides on publishing** (GitHub Packages under `@mobyuz`, per the plan).
8. **No `eslint-plugin-jsx-a11y`.** Its latest release (6.10.2) declares peer support only up to ESLint 9, and the repo uses ESLint 10 like the other repos. Accessibility is covered by axe tests instead.

## Evidence

- `npm ci`, lint, type check, 62 tests, build, and `npm pack --dry-run` ran on 2026-11-05 (see the README for the commands). The drift test fails when an expression is removed from the face's table (checked by hand once).
- The preview page was opened in the built-in browser in light and dark, with and without reduced motion. All nine expressions and the unknown value rendered, and with `reducedMotion` set there were no running animations.
- jsdom cannot compute colour contrast, so contrast is judged by eye on the preview page and is not machine-checked.

## Open

1. **Match the physical face more closely.** The geometry here is moved unchanged from `moby-desktop`. The robot's 128x64 monochrome face differs in eye size and position, in where the thinking dots, speaking mouth and mute icon sit, and it has no colour, glow, listening ring, or "?" mark. It shows `display_text` in place of the face. Both read as the same character (two rounded eyes, one motion per state), but they are not pixel-aligned. Aligning them is a design decision for the owner.
2. **Protocol source.** Replace `file:../moby-protocol` and the CI checkout with a pinned `@mobyuz/moby-protocol` version once the first tag exists.
