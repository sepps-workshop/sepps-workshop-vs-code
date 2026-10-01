// Shared by the test files; not part of the shipped extension.
import assert from "node:assert/strict";
import {
  contrast,
  alphaOver,
} from "@sepps-workshop/design-system/tools/build-tokens";

// What a theme colour looks like on `base`: itself if opaque, blended if not.
export const on = (colour, base) =>
  colour.length === 9
    ? alphaOver(colour.slice(0, 7), base, parseInt(colour.slice(7), 16) / 255)
    : colour;

export function assertContrast(label, fg, bg, min) {
  const ratio = contrast(fg, bg);
  assert.ok(
    ratio >= min,
    `${label}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`,
  );
}
