import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { EXPRESSION_META, FACE_EXPRESSIONS, MobyFace } from "../src/index";

afterEach(cleanup);

// jsdom has no layout or CSS engine, so colour contrast cannot be computed here.
// Contrast is checked by eye in the preview page instead (see README).
const options: axe.RunOptions = { rules: { "color-contrast": { enabled: false } } };

describe("accessible name", () => {
  it.each(FACE_EXPRESSIONS)("names %s from the expression", (expression) => {
    render(<MobyFace expression={expression} />);
    expect(screen.getByRole("img", { name: `Moby is ${EXPRESSION_META[expression].label.toLowerCase()}` })).toBeTruthy();
  });

  it("uses the caller's label", () => {
    render(<MobyFace expression="muted" label="Microphone is off" />);
    expect(screen.getByRole("img", { name: "Microphone is off" })).toBeTruthy();
  });

  it("can be hidden from assistive technology", () => {
    const { container } = render(<MobyFace expression="idle" decorative />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.hasAttribute("role")).toBe(false);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("is not focusable", () => {
    const { container } = render(<MobyFace expression="idle" />);
    expect(container.querySelector("svg")?.getAttribute("focusable")).toBe("false");
    expect(container.querySelector("svg")?.hasAttribute("tabindex")).toBe(false);
  });
});

describe("axe", () => {
  it.each(FACE_EXPRESSIONS)("finds no violations for %s", async (expression) => {
    const { container } = render(<MobyFace expression={expression} />);
    const results = await axe.run(container, options);
    expect(results.violations).toEqual([]);
  });

  it("finds no violations with a custom label, in both themes, or when decorative", async () => {
    const { container } = render(
      <main>
        <MobyFace expression="happy" label="Moby is pleased" theme="light" />
        <MobyFace expression="error" theme="dark" reducedMotion />
        <MobyFace expression="idle" decorative />
      </main>,
    );
    const results = await axe.run(container, options);
    expect(results.violations).toEqual([]);
  });
});
