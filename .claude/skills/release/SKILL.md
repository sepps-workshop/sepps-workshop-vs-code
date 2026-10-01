---
name: release
description: Release skill for sepps-workshop-vs-code — bumps version, updates CHANGELOG, commits, tags, and pushes. CI handles vsce publish. Use only when intentionally cutting a release.
disable-model-invocation: true
---

# VS Code Marketplace Publish Skill

Runs the full release sequence for sepps-workshop-vs-code: pre-flight → version bump → CHANGELOG update → commit → tag → push. The actual `vsce publish` runs in GitHub Actions after the tag lands.

## Pre-flight

Run all checks before doing anything else. Stop and report clearly if any fail.

- Verify on `main`: `git branch --show-current` must output `main`
- Verify working tree clean: `git status --porcelain` must produce no output
- Verify build passes: `npm run build` must exit without error
- Verify tests pass: `npm test` must exit without error

## CHANGELOG Check

Read `CHANGELOG.md`. Locate the `## [Unreleased]` section.

If it contains no entries (only the heading and surrounding blank lines), stop:

> The `[Unreleased]` section in CHANGELOG.md is empty. Document what changed before running `/release`.

Otherwise show the user the full contents of the `[Unreleased]` section and continue.

## Version Confirmation

Read `"version"` from `package.json` and show the current value.

Show the `[Unreleased]` contents again as context.

Ask the user to confirm the new version number. Suggest the appropriate bump:

- Patch (X.Y.Z+1): bug fixes, documentation updates
- Minor (X.Y+1.0): new workbench or syntax coverage, a foundation minor bump
- Major (X+1.0.0): breaking changes to the theme naming or structure

Wait for the user to confirm before proceeding.

## Bump Version

Edit `package.json`: change `"version"` to the confirmed version string.

## Update CHANGELOG

Edit `CHANGELOG.md`:

1. Replace the `## [Unreleased]` heading with `## [X.Y.Z] - YYYY-MM-DD` where `YYYY-MM-DD` is today's date in ISO 8601 format
2. Insert a new `## [Unreleased]` section at the top (before the versioned entry), with a blank line after the heading

The result should look like:

```
## [Unreleased]

## [X.Y.Z] - YYYY-MM-DD

### <category>

- <entry>

```

## Commit

```bash
git add package.json CHANGELOG.md
git commit -m "🔖 chore(release): bump to vX.Y.Z

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Tag

```bash
git tag -a vX.Y.Z -m "Version X.Y.Z"
```

## Push

```bash
git push && git push --tags
```

This fires the `publish-to-visual-studio-marketplace.yml` GitHub Actions workflow. `vsce publish` runs in CI using the `VSCE_PAT` secret — the PAT never touches the local machine.

## Confirm

Report to the user:

> Tag vX.Y.Z pushed. Monitor the publish run at: https://github.com/sepps-workshop/sepps-workshop-vs-code/actions
>
> The Marketplace listing typically updates within a few minutes of the workflow completing. Verify at: https://marketplace.visualstudio.com/items?itemName=sepps-workshop.sepps-workshop-theme
