#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { generateVersionInfo } = require("./generate-version-info");

/**
 * Script to automatically update the "Current Version Info" section
 * in the ExampleAppChangelog.txt file
 */

function updateChangelogVersions() {
  const changelogPath = path.join(
    __dirname,
    "../packages/react-native-room-kit/example/ExampleAppChangelog.txt",
  );

  try {
    // Read the existing changelog
    const content = fs.readFileSync(changelogPath, "utf8");

    // Generate new version info
    const newVersionInfo = generateVersionInfo();

    // Find and replace the "Current Version Info" section
    // Match from "---" followed by newlines and "Current Version Info:" to the end of file
    const regex = /---\s*\n\s*Current Version Info:[\s\S]*$/;

    let updatedContent;
    if (regex.test(content)) {
      // Replace existing version info
      updatedContent = content.replace(regex, newVersionInfo);
      console.log("✅ Updated existing version info section");
    } else {
      // Append to end of file if section doesn't exist
      updatedContent = content.trimEnd() + "\n\n" + newVersionInfo + "\n";
      console.log("✅ Added new version info section");
    }

    // Write back to file
    fs.writeFileSync(changelogPath, updatedContent, "utf8");
    console.log(`✅ Changelog updated: ${changelogPath}`);

    // Show what was written
    console.log("\n" + newVersionInfo);
  } catch (error) {
    console.error("❌ Error updating changelog:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateChangelogVersions();
}

module.exports = { updateChangelogVersions };
