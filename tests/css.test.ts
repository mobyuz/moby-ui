import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("stylesheet hygiene", () => {
  it("scopes every selector to .moby-face", () => {
    const preludes = [...css.matchAll(/([^{}]+)\{/g)].map((match) => (match[1] ?? "").trim());
    const selectors = preludes
      .filter((prelude) => !prelude.startsWith("@") && !/^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/.test(prelude))
      .flatMap((prelude) => prelude.split(",").map((part) => part.trim()))
      .filter(Boolean);
    expect(selectors.length).toBeGreaterThan(20);
    for (const selector of selectors) expect(selector).toMatch(/^\.moby-face/);
  });

  it("prefixes every keyframes name and custom property it declares", () => {
    for (const match of css.matchAll(/@keyframes\s+([\w-]+)/g)) expect(match[1]).toMatch(/^moby-face-/);
    for (const match of css.matchAll(/@property\s+(--[\w-]+)/g)) expect(match[1]).toMatch(/^--moby-face-/);
    for (const match of css.matchAll(/(--[\w-]+)\s*:/g)) expect(match[1]).toMatch(/^--moby-face-/);
  });

  it("loads nothing from outside", () => {
    expect(css).not.toMatch(/@import|@font-face|url\(|https?:/);
  });

  it("does not declare the public theme tokens, so ancestors can set them", () => {
    const declared = [...css.matchAll(/(--moby-face-[\w-]+)\s*:/g)].map((match) => match[1]);
    expect([...new Set(declared)]).toEqual(["--moby-face-current"]);
  });
});
