#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script to automatically generate version information from package files
 * This replaces manual updates to the "Current Version Info" section
 */

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function readPlistValue(filePath, key) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Simple regex to extract value after the key
    const regex = new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`);
    const match = content.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error(`Error reading plist ${filePath}:`, error.message);
    return null;
  }
}

function readGradleVersion(filePath, versionType) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const regex = new RegExp(`${versionType}\\s+(\\d+)`);
    const match = content.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error(`Error reading gradle ${filePath}:`, error.message);
    return null;
  }
}

function generateVersionInfo() {
  const rootDir = path.join(__dirname, "..");

  // Read package versions
  const roomKitPkg = readJsonFile(
    path.join(rootDir, "packages/react-native-room-kit/package.json"),
  );
  const hmsPkg = readJsonFile(
    path.join(rootDir, "packages/react-native-hms/package.json"),
  );
  const examplePkg = readJsonFile(
    path.join(rootDir, "packages/react-native-room-kit/example/package.json"),
  );
  const sdkVersions = readJsonFile(
    path.join(rootDir, "packages/react-native-hms/sdk-versions.json"),
  );

  // Read Android app version
  const androidVersionName = readGradleVersion(
    path.join(
      rootDir,
      "packages/react-native-room-kit/example/android/app/build.gradle",
    ),
    "versionName",
  );
  const androidVersionCode = readGradleVersion(
    path.join(
      rootDir,
      "packages/react-native-room-kit/example/android/app/build.gradle",
    ),
    "versionCode",
  );

  // Read iOS app version
  const iosVersion = readPlistValue(
    path.join(
      rootDir,
      "packages/react-native-room-kit/example/ios/RNExample/Info.plist",
    ),
    "CFBundleShortVersionString",
  );
  const iosBuild = readPlistValue(
    path.join(
      rootDir,
      "packages/react-native-room-kit/example/ios/RNExample/Info.plist",
    ),
    "CFBundleVersion",
  );

  // Determine build number (prefer Android, fallback to iOS)
  const buildNumber = androidVersionCode || iosBuild || "N/A";

  // Generate version info text
  const versionInfo = `
---

Current Version Info:
Room Kit: ${roomKitPkg?.version || "N/A"}
Example App Version: ${androidVersionName || iosVersion || "N/A"} (${buildNumber})
React Native: ${examplePkg?.dependencies?.["react-native"] || "N/A"}
React Native SDK: ${hmsPkg?.version || "N/A"}
Android SDK: ${sdkVersions?.android || "N/A"}
iOS SDK: ${sdkVersions?.ios || "N/A"}
`;

  return versionInfo.trim();
}

// Export for use in other scripts
if (require.main === module) {
  // Running as a script
  const versionInfo = generateVersionInfo();
  console.log(versionInfo);
} else {
  // Being imported as a module
  module.exports = { generateVersionInfo };
}
