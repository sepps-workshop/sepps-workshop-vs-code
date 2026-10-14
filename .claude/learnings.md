# Learnings

- 2026-10-07: In VS Code the editor and the terminal must be told apart at a glance (same complaint as in the earlier theme ports). The accepted fix: both on a dark canvas, with the panel's title row on a clearly different chrome colour between them; a bright terminal next to a dark editor was rejected. Measure surface distance, not only text contrast.
- 2026-10-14: F5 (Extension Development Host) does not show theme changes in the VS Code Agents window; it opens in its own profile with the installed theme. Test Agents window colours by installing the `.vsix` or by releasing.
- 2026-10-14: A darkening wash (`hover`, `active`) used as the fill of a bubble or card vanishes on both `bg` and `bg_chrome`; the chat request bubble needed `bg_soft`. Judge a fill by its distance from the surfaces around it, not only by the contrast of the text on it.
