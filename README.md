# moby-ui

The animated Moby face and shared React components. The face is the virtual twin of the robot's OLED screen: one drawing and one motion for each expression in `moby-protocol`.

Status: version 0.1.0, `private`. Nothing is published yet. License: GPL-3.0-only.

## Use

```tsx
import { MobyFace } from "@mobyuz/moby-ui";
import "@mobyuz/moby-ui/styles.css";

<MobyFace expression="listening" size={240} />;
```

Import `styles.css` once. It only touches `.moby-face`, `moby-face-*` keyframes, and `--moby-face-*` properties.

| Prop | Meaning |
| --- | --- |
| `expression` | A `moby-protocol` expression. Anything else is drawn as `error`, like the firmware does. |
| `reducedMotion` | `true` stops motion, `false` keeps it, leave it out to follow `prefers-reduced-motion`. |
| `size` | Width in px or any CSS length. The height follows the 2:1 screen. Default 256. |
| `label` | Accessible name. Default: "Moby is idle", "Moby is muted", and so on. |
| `decorative` | Hides the face from assistive technology when nearby text already says the same. |
| `theme` | `auto` (system), `light`, or `dark`. |
| `className` | Extra class on the `<svg>`. |

Also exported: `EXPRESSION_META` (label, status text, and motion per expression), `FACE_EXPRESSIONS`, and `isExpression`.

### Theming

Set any of these on the face or an ancestor. The library never declares them, so there is no specificity fight.

`--moby-face-screen`, `--moby-face-bezel`, `--moby-face-warning`, `--moby-face-glow`, and `--moby-face-mood-idle`, `-listening`, `-thinking`, `-speaking`, `-happy`, `-confused`, `-error`, `-muted`, `-disconnected`.

The screen is black in both themes, like the robot. Light and dark change the bezel. The CSS needs `light-dark()` and `@property`: Chromium 123, Firefox 120, Safari 17.5 or newer.

### Protocol dependency

`@mobyuz/moby-protocol` is a peer dependency used for types only. There is no tag yet, so, as in `moby-desktop` ADR 0001, the dev dependency is the sibling path `file:../moby-protocol`. Clone and build it next to this repo before installing:

```powershell
cd D:\repos\moby\moby-protocol
npm.cmd ci --ignore-scripts
npm.cmd run build
```

Replace this with a pinned version after the first protocol release.

## Develop (Windows PowerShell)

Needs Node 24.13.0 and npm 11.6.2 (see `.node-version`). If the C drive is full, point the temp and npm cache folders elsewhere first:

```powershell
$env:TEMP='D:\moby-cache\tmp'; $env:TMP='D:\moby-cache\tmp'; $env:npm_config_cache='D:\moby-cache\npm'
cd D:\repos\moby\moby-ui
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd pack --dry-run
```

`npm.cmd run test:a11y` runs only the axe checks. jsdom cannot compute colour contrast, so check contrast by eye on the preview page.

### Preview page

A static page, not part of the package, shows every expression with theme and motion switches:

```powershell
npm.cmd run preview:build
npm.cmd run preview
```

Then open <http://127.0.0.1:4173/>. It renders the component from `src/`.

## Differences from the robot face

The virtual face keeps the robot's character (two rounded eyes, one motion per state) but it is not pixel-identical to `moby-firmware/main/moby_face.c`:

- The robot is 128x64 monochrome. The virtual face is a 2:1 colour screen with a mood colour and glow per expression.
- Eye sizes and positions, the thinking dots, the speaking mouth, and the mute icon differ. The listening ring and the "?" of the confused face exist only here.
- The robot can show `display_text` instead of the face. This package does not.
- Unknown expressions draw as `error` on both.

See `docs/adr/0001-face-package.md`.

## Moving the consumers here (later step, not done)

- **moby-desktop:** delete `src/face/`, add the dependency, import `@mobyuz/moby-ui/styles.css`, and replace `EXPRESSION_META` imports. Its `styles.css` face rules and `@property --mood` go away, and `.robot` selectors in `app.css` become `.moby-face`. The app itself uses `--mood` on `[data-expression]` ancestors for the background glow, and the package does not export that property, so the app keeps its own mood colours or sets `--moby-face-mood-*` from the same source. Move `tests/face.test.ts` here (already covered).
- **moby-web:** its current robot is a decorative `div` drawing with no expressions. Replace it with `<MobyFace expression="idle" decorative />` or a labelled face, and drop its robot CSS.
- **Both:** a `@mobyuz` registry entry in `.npmrc` (token from the environment), and CI access to the package.
