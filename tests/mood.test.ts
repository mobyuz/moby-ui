import { readFileSync } from "node:fs";
import { EXPRESSIONS } from "@mobyuz/moby-protocol";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const mood = read("src/mood.css");
const face = read("src/styles.css");

/** `expression -> colour default`, read from `--<prefix>: var(--moby-face-mood-<name>, <colour>)` rules. */
function defaults(css: string, property: string): Record<string, string> {
  const found: Record<string, string> = {};
  const rule = new RegExp(String.raw`\[data-expression="(\w+)"\]\s*\{\s*${property}:\s*var\(--moby-face-mood-\1,\s*(#[0-9a-f]{6})\)`, "g");
  for (const match of css.matchAll(rule)) found[match[1] ?? ""] = match[2] ?? "";
  return found;
}

describe("mood.css", () => {
  it("defines --moby-mood for every expression, with the same colours as the face", () => {
    const moods = defaults(mood, "--moby-mood");
    expect(Object.keys(moods).sort()).toEqual([...EXPRESSIONS].sort());
    expect(moods).toEqual(defaults(face, "--moby-face-current"));
  });

  it("only declares --moby-mood and reads the public tokens", () => {
    for (const match of mood.matchAll(/(--[\w-]+)\s*:/g)) expect(match[1]).toBe("--moby-mood");
    for (const match of mood.matchAll(/@property\s+(--[\w-]+)/g)) expect(match[1]).toBe("--moby-mood");
  });

  it("stops the transition for reduced motion and loads nothing from outside", () => {
    expect(mood).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\[data-expression\]\s*\{\s*transition: none;/);
    expect(mood).not.toMatch(/@import|@font-face|url\(|https?:/);
  });
});
