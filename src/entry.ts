// Build entry only: it makes Vite emit dist/styles.css next to dist/index.js.
// The public types come from index.ts, so the stylesheet import stays out of the .d.ts files.
import "./styles.css";

export * from "./index";
