# Open items

State on 2026-10-14 (`main` at v0.4.0, foundation 0.11.0). Delete an item when it is done.

## Upstream, in `sepps-workshop-design-system`

Filed as [sepps-workshop/sepps-workshop-design-system#5](https://github.com/sepps-workshop/sepps-workshop-design-system/issues/5). After the foundation release:

- [ ] `punct` scopes catch string quotes and comment markers. Once the foundation publishes the delimiter scopes with their slots, drop the overrides "String quotes", "Comment markers", "Regex delimiters" and the docstring delimiter selector.
- [ ] ANSI colours on the find-match overlays. The port tests the pair itself ("ANSI colours stay readable on the terminal selection and find matches"); once the foundation gates it, the find-match keys can leave that test.
- [ ] Python `self` and `cls` in the signature, `cls` in the body, and Pylance's `selfParameter` / `clsParameter` semantic types. Nothing to drop in the port; update the foundation and rebuild.
