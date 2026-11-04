import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Library build: one ESM file plus styles.css. React and the JSX runtime stay external,
// and the protocol package is only imported for types, so it never reaches the bundle.
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    cssTarget: "chrome123",
    sourcemap: false,
    lib: {
      entry: "src/entry.ts",
      formats: ["es"],
      fileName: () => "index.js",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", /^@mobyuz\//],
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
