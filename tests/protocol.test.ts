import { EXPRESSIONS } from "@mobyuz/moby-protocol";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXPRESSION_META, FACE_EXPRESSIONS } from "../src/index";

describe("moby-protocol", () => {
  it("lists exactly the protocol's expressions, in its order", () => {
    expect(FACE_EXPRESSIONS).toEqual([...EXPRESSIONS]);
  });

  it("has metadata for every protocol expression and nothing else", () => {
    expect(Object.keys(EXPRESSION_META).sort()).toEqual([...EXPRESSIONS].sort());
  });

  it("styles every protocol expression", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const styled = [...css.matchAll(/\.moby-face\[data-expression="(\w+)"\]\s*\{/g)].map((match) => match[1]);
    expect(styled.sort()).toEqual([...EXPRESSIONS].sort());
  });
});
