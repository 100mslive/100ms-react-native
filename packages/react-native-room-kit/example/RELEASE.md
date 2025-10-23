# Release Guide for 100ms React Native Room Kit Example Apps

This document describes how to release the Android and iOS example apps for the 100ms React Native Room Kit.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Release Methods](#release-methods)
  - [Method 1: GitHub Actions (Recommended)](#method-1-github-actions-recommended)
  - [Method 2: Local Script](#method-2-local-script)
- [Release Process](#release-process)
- [Version Bumping](#version-bumping)
- [Distribution Channels](#distribution-channels)
- [Troubleshooting](#troubleshooting)

## Overview

The example apps are distributed through:

- **Android**: Firebase App Distribution
- **iOS**: Firebase App Distribution + TestFlight

Both automated (GitHub Actions) and manual (local script) release processes are supported.

## Prerequisites

### For GitHub Actions (Recommended)

- [ ] GitHub CLI (`gh`) installed and authenticated
- [ ] Access to the 100ms-react-native repository
- [ ] Updated `ExampleAppChangelog.txt`

### For Local Releases

- [ ] macOS (for iOS releases)
- [ ] Xcode with command line tools
- [ ] Node.js (v16+)
- [ ] npm
- [ ] Ruby (v3.2+)
- [ ] Bundler (`gem install bundler`)
- [ ] CocoaPods (`gem install cocoapods`)
- [ ] Fastlane (`gem install fastlane`)
- [ ] Clean git working directory
- [ ] Required credential files (see below)

### Required Credential Files (Local Only)

These are managed as GitHub Secrets for automated releases. For local releases, ensure these files exist:

**iOS:**

```
packages/react-native-room-kit/example/ios/fastlane/
  ├── reactnative-hms-a32ef61302c5.json  # Firebase service account
  └── AuthKey_BY94A5BH9T.p8              # App Store Connect API key
```

**Android:**

```
packages/react-native-room-kit/example/android/fastlane/
  └── reactnative-hms-a32ef61302c5.json  # Firebase service account
```

## Release Methods

### Method 1: GitHub Actions (Recommended) ⭐

**Advantages:**

- ✅ Automated, consistent builds
- ✅ Proper secrets management
- ✅ Full audit trail
- ✅ No local setup required
- ✅ Runs on dedicated CI infrastructure

**Steps:**

1. **Update the changelog:**

   ```bash
   vi packages/react-native-room-kit/example/ExampleAppChangelog.txt
   ```

2. **Commit and push changes:**

   ```bash
   git add packages/react-native-room-kit/example/ExampleAppChangelog.txt
   git commit -m "docs: update example app changelog"
   git push
   ```

3. **Trigger the release:**

   ```bash
   ./scripts/trigger-release.sh
   ```

   Or manually via GitHub Actions UI:

   - Go to: https://github.com/100mslive/100ms-react-native/actions
   - Select "Release Apps" workflow
   - Click "Run workflow"
   - Select branch: `release`
   - Click "Run workflow"

4. **Monitor the release:**
   - Watch progress: https://github.com/100mslive/100ms-react-native/actions
   - Check Slack notifications in #dogfooding channel
   - Verify on Firebase App Distribution
   - Verify on TestFlight (iOS only)

### Method 2: Local Script

**When to use:**

- Testing before pushing to GitHub
- Emergency releases when GitHub Actions is down
- Development/debugging

**Steps:**

1. **Ensure clean git state:**

   ```bash
   git status  # Should show "nothing to commit, working tree clean"
   ```

2. **Update the changelog:**

   ```bash
   vi packages/react-native-room-kit/example/ExampleAppChangelog.txt
   git add packages/react-native-room-kit/example/ExampleAppChangelog.txt
   git commit -m "docs: update example app changelog"
   ```

3. **Test with dry-run (optional but recommended):**

   ```bash
   ./release-apps.sh --dry-run
   ```

4. **Run the release:**

   ```bash
   ./release-apps.sh
   ```

   This will:

   - Validate prerequisites
   - Install dependencies (npm, pods, gems)
   - Build and release Android app (in parallel)
   - Build and release iOS app (in parallel)
   - Commit version changes
   - Push to git

5. **Expected duration:**
   - Total: ~20-30 minutes
   - Android: ~10-15 minutes
   - iOS: ~15-20 minutes

## Release Process

### What Happens During a Release

1. **Dependency Installation** (Sequential)

   - Install react-native-hms dependencies
   - Install react-native-room-kit dependencies
   - Install example app dependencies

2. **Version Bumping** (Automatic via Fastlane)

   - **Android**: Increments `versionCode` and patch version in `versionName`
   - **iOS**: Increments build number and patch version

3. **Building** (Parallel)

   - **Android**: Builds release APK
   - **iOS**:
     - Builds ad-hoc IPA for Firebase
     - Builds App Store IPA for TestFlight

4. **Distribution** (Automated)

   - Uploads to Firebase App Distribution
   - Sends to testers (internal + External groups)
   - Uploads iOS to TestFlight
   - Sends Slack notifications

5. **Git Operations**
   - Commits version bump changes
   - Pushes to remote

## Version Bumping

Versions are automatically bumped by Fastlane during the release process.

### Android

**File:** `example/android/app/build.gradle`

```gradle
versionCode 545           # Auto-incremented (+1)
versionName "2.4.95"      # Patch version incremented
```

**Fastlane lane:** `distribute_app` in `android/fastlane/Fastfile`

### iOS

**Files:**

- `example/ios/RNExample/Info.plist`
- `example/ios/RNExample.xcodeproj/project.pbxproj`

**Fastlane lane:** `bump_version` in `ios/fastlane/Fastfile`

## Distribution Channels

### Firebase App Distribution

**Android:**

- App ID: `1:408505141940:android:7fae09bd993f283fc325e1`
- Download: https://appdistribution.firebase.dev/i/7b7ab3b30e627c35
- Groups: internal, External

**iOS:**

- App ID: `1:408505141940:ios:1d2339892d9ffd8cc325e1`
- Download: https://appdistribution.firebase.dev/i/bdfa6517b69c31d6
- Groups: internal, External

### TestFlight (iOS only)

- Bundle ID: `live.100ms.reactnative`
- Download: https://testflight.apple.com/join/v4bSIPad
- Groups: External
- Auto-submit for review: Yes

### Slack Notifications

Releases trigger notifications in the `#dogfooding` Slack channel with:

- Platform (Android/iOS)
- Version number
- Build number
- Download links
- Changelog link

## Troubleshooting

### Common Issues

#### 1. "Git working directory is not clean"

**Solution:**

```bash
git status
git stash  # or commit your changes
```

#### 2. "Missing credential files"

**Solution:** Ensure Firebase service account JSON and App Store Connect API key are in place.

For Firebase credentials:

- Contact the team lead for the service account JSON
- Place in both `ios/fastlane/` and `android/fastlane/`

For App Store Connect:

- Obtain API key from App Store Connect
- Place in `ios/fastlane/AuthKey_BY94A5BH9T.p8`

#### 3. "pod install fails"

**Solution:**

```bash
cd packages/react-native-room-kit/example/ios
pod repo update
pod deintegrate
pod install
```

#### 4. "Fastlane build fails"

**Check:**

- Xcode version compatibility
- Provisioning profiles are valid
- Certificates are not expired
- Bundle identifier matches profiles

**Debug:**

```bash
cd ios  # or android
bundle exec fastlane distribute_app --verbose
```

#### 5. "Version extraction failed"

This should not happen with the new script. If it does:

**Solution:**

```bash
# Check build.gradle format
cat packages/react-native-room-kit/example/android/app/build.gradle | grep -A2 defaultConfig
```

Ensure `versionCode` and `versionName` follow this format:

```gradle
versionCode 545
versionName "2.4.95"
```

#### 6. "Firebase upload fails"

**Solution:**

```bash
# Verify Firebase CLI is working
firebase projects:list

# Re-authenticate if needed
firebase login
```

#### 7. "TestFlight upload fails"

**Common causes:**

- API key expired or invalid
- App version already exists
- Export options don't match provisioning

**Solution:**

```bash
# Test API key
xcrun altool --validate-app -f output.ipa --type ios \
  --apiKey BY94A5BH9T \
  --apiIssuer 7b598151-7443-44b8-a7e8-d5d48cb40412
```

### Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs (for automated releases)
3. Run with `--dry-run` first (for local releases)
4. Check Fastlane reports in `ios/fastlane/report.xml` or `android/fastlane/report.xml`
5. Contact the mobile team in #mobile-support

## Release Checklist

Use this checklist before each release:

- [ ] ExampleAppChangelog.txt updated with latest changes
- [ ] All desired features/fixes merged to release branch
- [ ] Tested on physical devices (Android + iOS)
- [ ] No known critical bugs
- [ ] Git working directory is clean
- [ ] Credential files in place (local releases only)

After release:

- [ ] Verify on Firebase App Distribution (both platforms)
- [ ] Verify on TestFlight (iOS)
- [ ] Check Slack notifications sent
- [ ] Test download and installation
- [ ] Notify testers in relevant channels

## Version History

To check version history:

```bash
# Git commits with version bumps
git log --all --grep="released sample app" --oneline

# Current versions
grep versionCode packages/react-native-room-kit/example/android/app/build.gradle
grep versionName packages/react-native-room-kit/example/android/app/build.gradle
```

## Scripts Reference

| Script                       | Purpose                         | Usage                           |
| ---------------------------- | ------------------------------- | ------------------------------- |
| `scripts/trigger-release.sh` | Trigger GitHub Actions workflow | `./scripts/trigger-release.sh`  |
| `release-apps.sh`            | Local release script            | `./release-apps.sh [--dry-run]` |

## Support

For questions or issues:

- Slack: #mobile-support
- GitHub Issues: https://github.com/100mslive/100ms-react-native/issues
