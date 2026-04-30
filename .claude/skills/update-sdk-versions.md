---
name: update-sdk-versions
description: Bump 100ms native SDK versions (HMSSDK iOS/Android) and the react-native-hms / react-native-room-kit npm package versions in lock-step across the monorepo. Use when the user mentions updating/bumping SDK versions, "new HMSSDK release", "sync sdk-versions.json", "bump react-native-hms version", "bump room-kit version", or asks to refresh the 100ms native SDK after a release on CocoaPods/Maven.
---

# Update SDK Versions

This monorepo has **six** files that must stay in sync whenever 100ms ships a new native SDK release. The task is repetitive and easy to get wrong by hand (we previously left `peerDependencies['@100mslive/react-native-hms']` stale at `1.12.0` while hms was at `1.12.1`). The `scripts/update-sdk-versions.js` script does the whole bump in one pass.

## When to use this skill

Invoke when the user asks any of:
- "Update SDK versions to 1.17.2 / 2.9.84"
- "Bump HMSSDK iOS"
- "Refresh 100ms native SDKs"
- "Bump react-native-hms patch / minor / major"
- "Sync sdk-versions.json with the latest 100ms release"

## When NOT to use this skill

- Sample-app marketing version bumps (e.g. `2.5.10 (553)`) — that's `release-apps.sh` via Fastlane.
- Changes to `react-native-hms.podspec` or `packages/react-native-hms/android/build.gradle` directly — those read from `sdk-versions.json` automatically; never edit them by hand for version changes.
- Hand-editing the "Current Version Info" block at the bottom of `ExampleAppChangelog.txt` — the script regenerates it.

## How to invoke

Always ask the user for the target versions first (the script does NOT auto-fetch from CocoaPods/Maven by design — the user provides them explicitly). Ask:

1. New iOS HMSSDK version (current value lives in `packages/react-native-hms/sdk-versions.json` → `ios`)
2. New Android HMSSDK version (current value in `sdk-versions.json` → `android`)
3. Should `@100mslive/react-native-hms` get a patch / minor / major bump (or skip)?
4. Should `@100mslive/react-native-room-kit` get a patch / minor / major bump (or skip)?

The ancillary iOS pods (`iOSBroadcastExtension`, `iOSHMSHLSPlayer`, `iOSNoiseCancellationModels`) change rarely — only ask if the user mentions them.

Then run:

```bash
node scripts/update-sdk-versions.js \
  --ios-sdk <ver> \
  --android-sdk <ver> \
  --hms-bump <skip|patch|minor|major> \
  --room-kit-bump <skip|patch|minor|major> \
  --yes
```

Use `--yes` only after you've echoed the proposed changes back to the user and they've confirmed. Without `--yes`, the script prompts for confirmation; in a non-interactive Claude run you must pass it.

Add `--ios-broadcast`, `--ios-hls`, `--ios-noise-cancel` when the user has provided new ancillary versions.

**Tip — preview without committing:** add `--dry-run` to print the proposed changes and exit without writing anything, running `npm install`, or refreshing the changelog. Useful when the user wants to "see what would change" before agreeing. Since it's read-only, `--dry-run` ignores the dirty-tree guard.

## What the script does

1. Updates `packages/react-native-hms/sdk-versions.json` with new native versions (the Podspec and Android `build.gradle` read from this — they're not edited).
2. Bumps `packages/react-native-hms/package.json` and its example.
3. Bumps `packages/react-native-room-kit/package.json` and its example.
4. **Always** sets `peerDependencies['@100mslive/react-native-hms']` in room-kit's `package.json` to the resolved hms version (auto-corrects drift, even when `--hms-bump=skip`).
5. Runs `npm install` in the four affected directories in parallel to refresh lock files.
6. Runs `node scripts/update-changelog-versions.js` to refresh the version block at the bottom of `ExampleAppChangelog.txt`.
7. Prints a suggested conventional-commit message.
8. Reminds you to `pod install` if any iOS native version changed (Podfile.lock isn't touched by `npm install`).

## After the script completes

1. **If iOS native versions changed**, run `pod install` so `Podfile.lock` picks up the new HMSSDK pod versions:
   ```bash
   cd packages/react-native-room-kit/example/ios && pod install
   cd packages/react-native-hms/example/ios && pod install
   ```
2. Show the user `git status` and `git diff --stat` so they can review.
3. Offer to commit and push using the suggested message the script printed. Use `LEFTHOOK=0 git commit --no-verify` if pre-existing repo lint debt blocks the commit (see `release-apps.sh` for precedent).

## Notes / gotchas

- Repo has no root `package.json`; invoke via `node scripts/update-sdk-versions.js` directly. Don't try `npm run`.
- Pre-commit Husky hook runs ESLint over the whole repo and tends to fail on pre-existing prose-formatting errors that are unrelated to a version bump — bypass with `--no-verify` for chore commits like this.
- The dirty-tree guard refuses to run if any of the version files already have uncommitted changes. Use `--force` to override (rare; usually safer to commit/stash first).
- The script is idempotent: running with current values is a no-op.
