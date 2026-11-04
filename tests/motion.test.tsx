import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EXPRESSION_META, FACE_EXPRESSIONS, MobyFace } from "../src/index";

const css = readFileSync("src/styles.css", "utf8");

afterEach(cleanup);

function motionOf(container: HTMLElement): string | null {
  return container.querySelector("svg")?.getAttribute("data-motion") ?? null;
}

describe("reduced motion", () => {
  it("follows the system setting unless told otherwise", () => {
    expect(motionOf(render(<MobyFace expression="idle" />).container)).toBe("auto");
  });

  it("stops motion when reducedMotion is true", () => {
    expect(motionOf(render(<MobyFace expression="thinking" reducedMotion />).container)).toBe("reduced");
  });

  it("keeps motion when reducedMotion is false", () => {
    expect(motionOf(render(<MobyFace expression="thinking" reducedMotion={false} />).container)).toBe("full");
  });

  it("changes when the prop changes", () => {
    const { container, rerender } = render(<MobyFace expression="speaking" reducedMotion />);
    rerender(<MobyFace expression="speaking" reducedMotion={undefined} />);
    expect(motionOf(container)).toBe("auto");
  });

  // jsdom does not run CSS, so these read the stylesheet that the component depends on.
  it("has CSS that turns animation and transitions off for the reduced and system-reduced cases", () => {
    const media = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
    expect(media).not.toBeNull();
    expect(media?.[1]).toContain('.moby-face[data-motion="auto"]');
    expect(media?.[1]).toMatch(/animation:\s*none !important/);
    expect(media?.[1]).toMatch(/transition:\s*none !important/);
    const tail = css.slice(css.indexOf("@media (prefers-reduced-motion"));
    expect(tail).toContain('.moby-face[data-motion="reduced"]');
    expect(tail).not.toContain('[data-motion="full"]');
  });

  it("defines one CSS motion for each expression and no animation without keyframes", () => {
    for (const expression of FACE_EXPRESSIONS) {
      expect(css).toContain(`[data-animation="${EXPRESSION_META[expression].animation}"]`);
      expect(css).toContain(`[data-expression="${expression}"]`);
    }
    const keyframes = [...css.matchAll(/@keyframes ([\w-]+)/g)].map((match) => match[1]);
    const used = [...css.matchAll(/animation:\s*(?!none)([\w-]+)/g)].map((match) => match[1]);
    expect(used.length).toBeGreaterThan(0);
    for (const name of used) expect(keyframes).toContain(name);
  });
});

describe("lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts no timers, frames, or listeners, so unmount leaves nothing behind", () => {
    const addWindow = vi.spyOn(window, "addEventListener");
    const addDocument = vi.spyOn(document, "addEventListener");
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const headBefore = document.head.innerHTML;

    for (const expression of FACE_EXPRESSIONS) {
      const { unmount, rerender } = render(<MobyFace expression={expression} />);
      expect(vi.getTimerCount()).toBe(0);
      rerender(<MobyFace expression="happy" reducedMotion />);
      unmount();
    }

    vi.runAllTimers();
    expect(vi.getTimerCount()).toBe(0);
    expect(raf).not.toHaveBeenCalled();
    expect(addWindow).not.toHaveBeenCalled();
    expect(addDocument).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.head.innerHTML).toBe(headBefore);
    expect(document.querySelector("svg")).toBeNull();
    vi.unstubAllGlobals();
  });

  it("removes every node it created on unmount", () => {
    const { unmount, container } = render(<MobyFace expression="thinking" />);
    expect(container.querySelector("svg")).not.toBeNull();
    unmount();
    expect(document.body.querySelector("svg")).toBeNull();
  });
});
