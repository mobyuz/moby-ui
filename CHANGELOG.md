# Changelog

All notable changes to this package. The version stays 0.x and the package stays
`private` until the owner decides how to publish it.

## [Unreleased]

## [0.1.0] - 2026-11-05

### Added

- `MobyFace`: the animated Moby face for every `moby-protocol` expression, drawn as
  inline SVG and animated with CSS only. Props: `expression`, `reducedMotion`
  (override), `size`, `label`, `decorative`, `theme`, `className`.
- `EXPRESSION_META`, `FACE_EXPRESSIONS`, and `isExpression`.
- `styles.css` with scoped, themeable `--moby-face-*` tokens, light and dark, and
  reduced-motion support.
- A static preview page (`npm run preview:build`), not part of the package.
- Tests (Vitest, Testing Library, axe), ESLint, strict TypeScript, and CI.
