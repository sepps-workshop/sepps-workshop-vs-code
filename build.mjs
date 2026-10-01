// Reads foundation tokens from @sepps-workshop/design-system, emits the
// VS Code color-theme JSON and copies the icon from the foundation.

import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tokens from "@sepps-workshop/design-system";

import { buildTheme } from "./src/theme-template.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const THEME = join(ROOT, "themes", "sepps-workshop-color-theme.json");

mkdirSync(dirname(THEME), { recursive: true });
writeFileSync(
  THEME,
  JSON.stringify(buildTheme(tokens), null, 2) + "\n",
  "utf8",
);

// The icon is the foundation's render; copying it here keeps it from drifting.
copyFileSync(
  fileURLToPath(
    import.meta.resolve("@sepps-workshop/design-system/assets/icon-256.png"),
  ),
  join(ROOT, "icon.png"),
);

console.log("Built themes/sepps-workshop-color-theme.json and icon.png");
