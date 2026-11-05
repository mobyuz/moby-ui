// mood.css is a second, standalone stylesheet. Vite's library mode folds all CSS into
// styles.css, so it is copied into dist unchanged after the build.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/mood.css", "dist/mood.css");
