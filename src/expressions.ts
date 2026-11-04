import type { Expression } from "@mobyuz/moby-protocol";

/** One distinct CSS motion per expression. */
export type FaceAnimation =
  | "blink"
  | "pulse"
  | "orbit"
  | "talk"
  | "bounce"
  | "wobble"
  | "shake"
  | "breathe"
  | "flicker";

export interface ExpressionMeta {
  /** Short name, used in the default accessible label. */
  label: string;
  /** Plain-language status line a screen can show next to the face. */
  status: string;
  animation: FaceAnimation;
}

/**
 * Typed against the protocol's `Expression`, so a protocol change that adds or
 * removes a value fails type checking here until this table is updated.
 */
export const EXPRESSION_META: Readonly<Record<Expression, ExpressionMeta>> = {
  idle: { label: "Idle", status: "Ready", animation: "blink" },
  listening: { label: "Listening", status: "Listening", animation: "pulse" },
  thinking: { label: "Thinking", status: "Thinking", animation: "orbit" },
  speaking: { label: "Speaking", status: "Answering", animation: "talk" },
  happy: { label: "Happy", status: "Done", animation: "bounce" },
  confused: { label: "Confused", status: "Didn't understand", animation: "wobble" },
  error: { label: "Error", status: "Something went wrong", animation: "shake" },
  muted: { label: "Muted", status: "Microphone off", animation: "breathe" },
  disconnected: { label: "Disconnected", status: "Can't connect", animation: "flicker" },
};

/** Every expression the face can draw, in the protocol's order. */
export const FACE_EXPRESSIONS = Object.keys(EXPRESSION_META) as readonly Expression[];

export function isExpression(value: unknown): value is Expression {
  return typeof value === "string" && Object.hasOwn(EXPRESSION_META, value);
}
