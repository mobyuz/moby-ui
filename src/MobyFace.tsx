import type { Expression } from "@mobyuz/moby-protocol";
import type { ReactNode } from "react";
import { EXPRESSION_META, isExpression } from "./expressions";

const LEFT = 84;
const RIGHT = 172;
const EYE_Y = 56;

function RoundEyes({ width, height, dx = 0, dy = 0 }: { width: number; height: number; dx?: number; dy?: number }) {
  return (
    <g className="moby-face__eyes">
      {[LEFT, RIGHT].map((cx) => (
        <rect
          key={cx}
          className="moby-face__eye"
          x={cx + dx - width / 2}
          y={EYE_Y + dy - height / 2}
          width={width}
          height={height}
          rx={width / 2}
        />
      ))}
    </g>
  );
}

function ArcEyes() {
  return (
    <g className="moby-face__eyes">
      {[LEFT, RIGHT].map((cx) => (
        <path
          key={cx}
          className="moby-face__stroke"
          d={`M ${cx - 20} ${EYE_Y + 10} Q ${cx} ${EYE_Y - 22} ${cx + 20} ${EYE_Y + 10}`}
        />
      ))}
    </g>
  );
}

function ClosedEyes() {
  return (
    <g className="moby-face__eyes">
      {[LEFT, RIGHT].map((cx) => (
        <path key={cx} className="moby-face__stroke" d={`M ${cx - 20} ${EYE_Y} Q ${cx} ${EYE_Y + 12} ${cx + 20} ${EYE_Y}`} />
      ))}
    </g>
  );
}

function CrossEyes() {
  return (
    <g className="moby-face__eyes">
      {[LEFT, RIGHT].map((cx) => (
        <path
          key={cx}
          className="moby-face__stroke"
          d={`M ${cx - 14} ${EYE_Y - 14} L ${cx + 14} ${EYE_Y + 14} M ${cx + 14} ${EYE_Y - 14} L ${cx - 14} ${EYE_Y + 14}`}
        />
      ))}
    </g>
  );
}

function Features({ expression }: { expression: Expression }): ReactNode {
  switch (expression) {
    case "idle":
      return <RoundEyes width={28} height={40} />;
    case "listening":
      return (
        <>
          <RoundEyes width={36} height={50} />
          <rect className="moby-face__ring" x={6} y={6} width={244} height={116} rx={24} />
        </>
      );
    case "thinking":
      return (
        <>
          <RoundEyes width={24} height={30} dx={8} dy={-6} />
          <g className="moby-face__dots">
            {[0, 1, 2].map((i) => (
              <circle key={i} className="moby-face__dot" cx={112 + i * 16} cy={102} r={4} />
            ))}
          </g>
        </>
      );
    case "speaking":
      return (
        <>
          <RoundEyes width={28} height={34} dy={-8} />
          <g className="moby-face__bars">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} className="moby-face__bar" x={96 + i * 14} y={92} width={8} height={24} rx={4} />
            ))}
          </g>
        </>
      );
    case "happy":
      return <ArcEyes />;
    case "confused":
      return (
        <>
          <RoundEyes width={36} height={48} dx={-6} />
          <rect
            className="moby-face__eye moby-face__eye--tilted"
            x={RIGHT - 26}
            y={EYE_Y - 8}
            width={22}
            height={16}
            rx={8}
          />
          <text className="moby-face__mark" x={214} y={36}>
            ?
          </text>
        </>
      );
    case "error":
      return (
        <>
          <CrossEyes />
          <path
            className="moby-face__stroke moby-face__stroke--thin"
            d="M 100 100 L 112 94 L 124 106 L 136 94 L 148 106 L 156 100"
          />
        </>
      );
    case "muted":
      return (
        <>
          <ClosedEyes />
          <g className="moby-face__mic">
            <rect className="moby-face__stroke moby-face__stroke--thin" x={120} y={84} width={16} height={26} rx={8} />
            <path className="moby-face__stroke moby-face__stroke--thin" d="M 114 104 Q 128 122 142 104" />
            <path className="moby-face__slash" d="M 110 118 L 146 80" />
          </g>
        </>
      );
    case "disconnected":
      return (
        <>
          <g className="moby-face__eyes">
            {[LEFT, RIGHT].map((cx) => (
              <rect
                key={cx}
                className="moby-face__eye moby-face__eye--outline"
                x={cx - 14}
                y={EYE_Y - 20}
                width={28}
                height={40}
                rx={14}
              />
            ))}
          </g>
          <g className="moby-face__link">
            <path
              className="moby-face__stroke moby-face__stroke--thin"
              d="M 108 104 h 10 a 8 8 0 0 0 0 -16 h -4 M 148 88 h -10 a 8 8 0 0 0 0 16 h 4"
            />
            <path className="moby-face__slash" d="M 122 112 L 134 80" />
          </g>
        </>
      );
  }
}

export interface MobyFaceProps {
  /** A protocol expression. Anything else is drawn as `error`, like the robot does. */
  expression: Expression;
  /**
   * `true` stops all motion, `false` keeps it even when the system asks for less.
   * Leave it out to follow `prefers-reduced-motion`.
   */
  reducedMotion?: boolean | undefined;
  /** Width in CSS pixels, or any CSS length as a string. The height follows the 2:1 screen. Default 256. */
  size?: number | string;
  /** Accessible name. Defaults to "Moby is <expression>". */
  label?: string;
  /** Hide the face from assistive technology, for when the surrounding text already says it. */
  decorative?: boolean;
  /** `auto` follows the system colour scheme; `light` and `dark` force it for this face. */
  theme?: "auto" | "light" | "dark";
  className?: string;
}

/** Moby's OLED screen. The same character the robot shows, drawn as inline SVG and animated with CSS only. */
export function MobyFace({
  expression,
  reducedMotion,
  size = 256,
  label,
  decorative = false,
  theme = "auto",
  className,
}: MobyFaceProps) {
  // An unknown value is protocol drift or a bad caller. The firmware also draws error for it.
  const shown: Expression = isExpression(expression) ? expression : "error";
  const meta = EXPRESSION_META[shown];
  const motion = reducedMotion === undefined ? "auto" : reducedMotion ? "reduced" : "full";
  const accessibility = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": label ?? `Moby is ${meta.label.toLowerCase()}` } as const);
  return (
    <svg
      className={className ? `moby-face ${className}` : "moby-face"}
      data-expression={shown}
      data-animation={meta.animation}
      data-motion={motion}
      data-theme={theme}
      viewBox="0 0 256 128"
      width={size}
      focusable="false"
      {...accessibility}
    >
      <rect className="moby-face__screen" width={256} height={128} rx={36} />
      <g className="moby-face__face">
        <Features expression={shown} />
      </g>
    </svg>
  );
}
