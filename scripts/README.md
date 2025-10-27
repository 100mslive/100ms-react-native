# Scripts

This directory contains utility scripts for automating various tasks in the 100ms React Native monorepo.

## Version Management Scripts

### generate-version-info.js

Automatically extracts version information from various package and configuration files.

**Usage:**

```bash
node scripts/generate-version-info.js
```

**What it extracts:**

- Room Kit version from `packages/react-native-room-kit/package.json`
- React Native SDK version from `packages/react-native-hms/package.json`
- Example app version from Android `build.gradle` and iOS `Info.plist`
- React Native version from example app's `package.json`
- Native SDK versions from `packages/react-native-hms/sdk-versions.json`

**Output example:**

```
---

Current Version Info:
Room Kit: 1.3.0
Example App Version: 2.5.3 (546)
React Native: 0.77.3
React Native SDK: 1.12.0
Android SDK: 2.9.78
iOS SDK: 1.17.0
```

**Note:** The build number shown is unified for both Android and iOS platforms (they should always be kept in sync).

### update-changelog-versions.js

Automatically updates the "Current Version Info" section in the ExampleAppChangelog.txt file.

**Usage:**

```bash
node scripts/update-changelog-versions.js
```

**When to use:**

- After bumping any package version
- After updating native SDK versions in `sdk-versions.json`
- After updating React Native version
- Before creating a release
- As part of your CI/CD pipeline

**What it does:**

1. Reads all version information from source files
2. Finds the "Current Version Info" section in the changelog
3. Replaces it with the latest versions
4. Preserves all the manual changelog content above it

## Adding to Your Workflow

### Manual Usage

Run the update script whenever you make version changes:

```bash
# After bumping versions
node scripts/update-changelog-versions.js

# Verify the changes
git diff packages/react-native-room-kit/example/ExampleAppChangelog.txt

# Commit the updated changelog
git add packages/react-native-room-kit/example/ExampleAppChangelog.txt
git commit -m "chore: update changelog version info"
```

### As a Git Hook

Add to `.husky/pre-commit` or your commit hooks:

```bash
# Update version info before commit
node scripts/update-changelog-versions.js
git add packages/react-native-room-kit/example/ExampleAppChangelog.txt
```

### In CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Update Changelog Versions
  run: node scripts/update-changelog-versions.js

- name: Commit Changes
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add packages/react-native-room-kit/example/ExampleAppChangelog.txt
    git commit -m "chore: update changelog version info [skip ci]" || true
    git push
```

### In package.json Scripts

You can add npm scripts to the individual packages:

```json
{
  "scripts": {
    "update-versions": "node ../../scripts/update-changelog-versions.js"
  }
}
```

## Benefits

1. **No Manual Updates**: Version info is automatically extracted from source files
2. **Always Accurate**: Impossible to have version mismatches
3. **Time Saving**: No need to manually check and update 6+ different version numbers
4. **Automation Ready**: Easy to integrate into CI/CD pipelines
5. **Single Source of Truth**: All versions come from their authoritative sources

## File Sources

The scripts read from these files:

| Version Info          | Source File                                                       |
| --------------------- | ----------------------------------------------------------------- |
| Room Kit              | `packages/react-native-room-kit/package.json`                     |
| React Native SDK      | `packages/react-native-hms/package.json`                          |
| Android SDK           | `packages/react-native-hms/sdk-versions.json`                     |
| iOS SDK               | `packages/react-native-hms/sdk-versions.json`                     |
| React Native          | `packages/react-native-room-kit/example/package.json`             |
| Example App (Android) | `packages/react-native-room-kit/example/android/app/build.gradle` |
| Example App (iOS)     | `packages/react-native-room-kit/example/ios/RNExample/Info.plist` |

## Troubleshooting

**Script can't find files:**

- Make sure you run the script from the repository root
- Check that all source files exist in their expected locations

**Version shows as "N/A":**

- Check that the source file exists
- Verify the file format hasn't changed
- Check file permissions

**Changelog not updating:**

- Ensure the changelog has a "---" separator before "Current Version Info:"
- Check file write permissions
- Verify the changelog path is correct
