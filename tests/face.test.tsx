import type { Expression } from "@mobyuz/moby-protocol";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EXPRESSION_META, FACE_EXPRESSIONS, isExpression, MobyFace } from "../src/index";

afterEach(cleanup);

function svgOf(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector("svg");
  if (!svg) throw new Error("no svg rendered");
  return svg;
}

describe("MobyFace expressions", () => {
  it.each(FACE_EXPRESSIONS)("renders %s", (expression) => {
    const { container } = render(<MobyFace expression={expression} />);
    const svg = svgOf(container);
    expect(svg.getAttribute("data-expression")).toBe(expression);
    expect(svg.getAttribute("data-animation")).toBe(EXPRESSION_META[expression].animation);
    expect(svg.querySelector(".moby-face__screen")).not.toBeNull();
    expect(svg.querySelectorAll("[class*='moby-face__']").length).toBeGreaterThan(2);
  });

  it("draws every expression differently", () => {
    const drawn = FACE_EXPRESSIONS.map((expression) => svgOf(render(<MobyFace expression={expression} />).container).innerHTML);
    expect(new Set(drawn).size).toBe(FACE_EXPRESSIONS.length);
  });

  it("gives every expression its own motion", () => {
    const animations = FACE_EXPRESSIONS.map((expression) => EXPRESSION_META[expression].animation);
    expect(new Set(animations).size).toBe(FACE_EXPRESSIONS.length);
  });

  it.each([undefined, null, "", "dancing", "IDLE", 7, {}, "__proto__", "constructor", "toString"])(
    "draws %j as error without crashing",
    (value) => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const { container } = render(<MobyFace expression={value as unknown as Expression} />);
      expect(svgOf(container).getAttribute("data-expression")).toBe("error");
      expect(spy).not.toHaveBeenCalled();
    },
  );

  it("tells real expressions from other values", () => {
    expect(FACE_EXPRESSIONS.every(isExpression)).toBe(true);
    expect(isExpression("toString")).toBe(false);
    expect(isExpression(undefined)).toBe(false);
  });

  it("sizes the face by width and keeps the 2:1 screen", () => {
    const { container, rerender } = render(<MobyFace expression="idle" size={120} />);
    expect(svgOf(container).getAttribute("width")).toBe("120");
    expect(svgOf(container).getAttribute("viewBox")).toBe("0 0 256 128");
    rerender(<MobyFace expression="idle" size="100%" />);
    expect(svgOf(container).getAttribute("width")).toBe("100%");
    expect(svgOf(container).hasAttribute("style")).toBe(false);
  });

  it("keeps the caller's class next to its own", () => {
    const { container } = render(<MobyFace expression="idle" className="hero" />);
    expect(svgOf(container).getAttribute("class")).toBe("moby-face hero");
  });

  it("passes the theme through", () => {
    const { container } = render(<MobyFace expression="idle" theme="dark" />);
    expect(svgOf(container).getAttribute("data-theme")).toBe("dark");
  });
});
