import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// A static page that shows every expression. It is not part of the published package.
export default defineConfig({
  root: "preview",
  base: "./",
  plugins: [react()],
  build: { outDir: "../preview-dist", emptyOutDir: true, target: "es2022", sourcemap: false },
  preview: { port: 4173, strictPort: true },
});
