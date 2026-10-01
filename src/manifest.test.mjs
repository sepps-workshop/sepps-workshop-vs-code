import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tokens from "@sepps-workshop/design-system";
import { buildTheme } from "./theme-template.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const manifest = JSON.parse(read("package.json"));
const [entry] = manifest.contributes.themes;

test("the manifest contributes exactly one dark theme", () => {
  assert.equal(manifest.contributes.themes.length, 1);
  assert.equal(entry.uiTheme, "vs-dark");
  assert.equal(entry.label, buildTheme(tokens).name);
});

test("the committed theme file is what the build produces", () => {
  assert.equal(
    read(entry.path).toString("utf8"),
    JSON.stringify(buildTheme(tokens), null, 2) + "\n",
    "themes/ is stale: run `npm run build`",
  );
});

test("the gallery banner is the canvas colour", () => {
  assert.equal(manifest.galleryBanner.color, tokens.surface.bg);
  assert.equal(manifest.galleryBanner.theme, "dark");
});

test("the icon is the foundation's 256 px render", () => {
  const source = readFileSync(
    fileURLToPath(
      import.meta.resolve("@sepps-workshop/design-system/assets/icon-256.png"),
    ),
  );
  assert.ok(read(manifest.icon).equals(source), "icon.png is stale");
});
