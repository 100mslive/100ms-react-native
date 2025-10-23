#!/bin/bash
#
# Release Script for 100ms React Native Room Kit Example Apps
#
# This script builds and releases both Android and iOS example apps
# to Firebase App Distribution and (iOS only) TestFlight.
#
# Usage:
#   ./release-apps.sh           # Normal release
#   ./release-apps.sh --dry-run # Test without actually releasing
#
# Prerequisites:
#   - npm, bundle, pod, git, fastlane installed
#   - Clean git working directory
#   - Updated ExampleAppChangelog.txt
#   - Required credentials in place (see RELEASE.md)
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(git rev-parse --show-toplevel)"
ROOM_KIT_DIR="$REPO_ROOT/packages/react-native-room-kit"
HMS_DIR="$REPO_ROOT/packages/react-native-hms"
EXAMPLE_DIR="$ROOM_KIT_DIR/example"
ANDROID_DIR="$EXAMPLE_DIR/android"
IOS_DIR="$EXAMPLE_DIR/ios"
CHANGELOG_FILE="$EXAMPLE_DIR/ExampleAppChangelog.txt"

# Runtime state
ORIGINAL_DIR="$(pwd)"
DRY_RUN=false
ANDROID_PID=""
IOS_PID=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
  --dry-run)
    DRY_RUN=true
    shift
    ;;
  --help | -h)
    head -20 "$0" | grep "^#" | sed 's/^# \?//'
    exit 0
    ;;
  *)
    echo -e "${RED}Unknown option: $1${NC}"
    exit 1
    ;;
  esac
done

# Cleanup function
cleanup() {
  local exit_code=$?

  # Kill background processes if they exist
  if [[ -n $ANDROID_PID ]] && kill -0 "$ANDROID_PID" 2>/dev/null; then
    echo -e "${YELLOW}Cleaning up Android build process...${NC}"
    kill "$ANDROID_PID" 2>/dev/null || true
  fi

  if [[ -n $IOS_PID ]] && kill -0 "$IOS_PID" 2>/dev/null; then
    echo -e "${YELLOW}Cleaning up iOS build process...${NC}"
    kill "$IOS_PID" 2>/dev/null || true
  fi

  # Return to original directory
  cd "$ORIGINAL_DIR"

  if [[ $exit_code -ne 0 ]]; then
    echo -e "${RED}❌ Release failed with exit code $exit_code${NC}"
  fi
}

trap cleanup EXIT

# Logging helpers
log_step() {
  echo -e "${BLUE}==>${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Validation functions
validate_prerequisites() {
  log_step "Validating prerequisites..."

  local missing_tools=()

  # Check required commands
  for cmd in npm bundle pod git fastlane; do
    if ! command -v "$cmd" &>/dev/null; then
      missing_tools+=("$cmd")
    fi
  done

  if [[ ${#missing_tools[@]} -gt 0 ]]; then
    log_error "Missing required tools: ${missing_tools[*]}"
    echo "Please install missing tools and try again."
    exit 1
  fi

  log_success "All required tools are installed"

  # Check git working directory
  if [[ -n $(git status --porcelain) ]]; then
    log_error "Git working directory is not clean"
    echo "Please commit or stash your changes before releasing."
    git status --short
    exit 1
  fi

  log_success "Git working directory is clean"

  # Check changelog was updated recently (within last 24 hours)
  if [[ ! -f $CHANGELOG_FILE ]]; then
    log_error "Changelog file not found: $CHANGELOG_FILE"
    exit 1
  fi

  local changelog_age=$(($(date +%s) - $(stat -f %m "$CHANGELOG_FILE" 2>/dev/null || stat -c %Y "$CHANGELOG_FILE")))
  if [[ $changelog_age -gt 86400 ]]; then
    log_warning "Changelog was last modified more than 24 hours ago"
    read -p "Continue anyway? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi

  log_success "Changelog exists and appears updated"

  # Check for required credential files
  local missing_creds=()

  if [[ ! -f "$IOS_DIR/fastlane/reactnative-hms-a32ef61302c5.json" ]]; then
    missing_creds+=("iOS Firebase credentials")
  fi

  if [[ ! -f "$IOS_DIR/fastlane/AuthKey_BY94A5BH9T.p8" ]]; then
    missing_creds+=("iOS App Store Connect API key")
  fi

  if [[ ! -f "$ANDROID_DIR/fastlane/reactnative-hms-a32ef61302c5.json" ]]; then
    missing_creds+=("Android Firebase credentials")
  fi

  if [[ ${#missing_creds[@]} -gt 0 ]]; then
    log_error "Missing credential files: ${missing_creds[*]}"
    echo "Please ensure all required credentials are in place."
    exit 1
  fi

  log_success "All required credential files found"
}

# Install dependencies
perform_npm_actions() {
  log_step "Installing npm dependencies..."

  # Install HMS package dependencies
  log_step "Installing react-native-hms dependencies..."
  cd "$HMS_DIR"
  npm install
  log_success "HMS dependencies installed"

  # Install Room Kit package dependencies
  log_step "Installing react-native-room-kit dependencies..."
  cd "$ROOM_KIT_DIR"
  npm install
  log_success "Room Kit dependencies installed"

  # Install example app dependencies
  log_step "Installing example app dependencies..."
  cd "$EXAMPLE_DIR"
  npm install
  log_success "Example app dependencies installed"
}

# Release Android app
release_android() {
  log_step "🤖 Building and releasing Android app..."

  cd "$ANDROID_DIR"

  if [[ $DRY_RUN == "true" ]]; then
    log_warning "DRY RUN: Skipping bundle install and fastlane"
    return 0
  fi

  bundle install --verbose
  bundle exec fastlane distribute_app

  log_success "Android app released successfully"
}

# Release iOS app
release_iOS() {
  log_step "🍎 Building and releasing iOS app..."

  cd "$IOS_DIR"

  if [[ $DRY_RUN == "true" ]]; then
    log_warning "DRY RUN: Skipping pod install, bundle install, and fastlane"
    return 0
  fi

  pod install --verbose
  bundle install --verbose
  bundle exec fastlane distribute_app

  log_success "iOS app released successfully"
}

# Extract version information
extract_version_info() {
  local build_gradle="$EXAMPLE_DIR/android/app/build.gradle"
  local version_code=""
  local version_name=""

  # Read and parse build.gradle
  while IFS= read -r line; do
    # Match versionCode with whitespace handling
    if [[ $line =~ versionCode[[:space:]]+([0-9]+) ]]; then
      version_code="${BASH_REMATCH[1]}"
    fi

    # Match versionName with whitespace handling
    if [[ $line =~ versionName[[:space:]]+\"([0-9]+\.[0-9]+\.[0-9]+)\" ]]; then
      version_name="${BASH_REMATCH[1]}"
    fi
  done <"$build_gradle"

  # Validate extraction succeeded
  if [[ -z $version_code ]] || [[ -z $version_name ]]; then
    log_error "Failed to extract version information from build.gradle"
    echo "versionCode: $version_code"
    echo "versionName: $version_name"
    exit 1
  fi

  echo "$version_name|$version_code"
}

# Perform git operations
perform_git_actions() {
  log_step "Committing version changes to git..."

  cd "$REPO_ROOT"

  # Extract version info
  local version_info
  version_info=$(extract_version_info)
  local version_name="${version_info%|*}"
  local build_number="${version_info#*|}"

  log_step "Version: $version_name ($build_number)"

  if [[ $DRY_RUN == "true" ]]; then
    log_warning "DRY RUN: Skipping git operations"
    log_step "Would commit with message: released sample app version $version_name ($build_number) ⚛️"
    return 0
  fi

  # Stage the version files
  git add "$EXAMPLE_DIR/android/app/build.gradle"
  git add "$IOS_DIR/Podfile.lock"
  git add "$IOS_DIR/RNExample/Info.plist"
  git add "$IOS_DIR/RNExample.xcodeproj/project.pbxproj"

  # Check if there are any changes to commit
  if git diff --cached --quiet; then
    log_warning "No version changes to commit"
    return 0
  fi

  # Commit and push
  git commit -m "released sample app version $version_name ($build_number) ⚛️"
  git push --verbose

  log_success "Version changes committed and pushed"
}

# Main execution
main() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║                                                            ║${NC}"
  echo -e "${BLUE}║   100ms React Native Room Kit - Release Script            ║${NC}"
  echo -e "${BLUE}║                                                            ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  if [[ $DRY_RUN == "true" ]]; then
    log_warning "🧪 DRY RUN MODE - No actual builds or releases will be performed"
    echo ""
  fi

  local start_time=$(date +%s)

  # Phase 1: Validation
  validate_prerequisites
  echo ""

  # Phase 2: Install dependencies (sequential, required for builds)
  perform_npm_actions
  echo ""

  # Phase 3: Build and release (parallel, independent)
  log_step "Starting platform releases in parallel..."

  release_android &
  ANDROID_PID=$!

  release_iOS &
  IOS_PID=$!

  # Wait for both releases to complete
  local android_exit=0
  local ios_exit=0

  wait $ANDROID_PID || android_exit=$?
  wait $IOS_PID || ios_exit=$?

  # Clear PIDs since processes are done
  ANDROID_PID=""
  IOS_PID=""

  # Check if both succeeded
  if [[ $android_exit -ne 0 ]]; then
    log_error "Android release failed with exit code $android_exit"
  fi

  if [[ $ios_exit -ne 0 ]]; then
    log_error "iOS release failed with exit code $ios_exit"
  fi

  if [[ $android_exit -ne 0 ]] || [[ $ios_exit -ne 0 ]]; then
    exit 1
  fi

  echo ""
  log_success "Both platform releases completed successfully"
  echo ""

  # Phase 4: Git operations
  perform_git_actions
  echo ""

  # Summary
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  local minutes=$((duration / 60))
  local seconds=$((duration % 60))

  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                                            ║${NC}"
  echo -e "${GREEN}║   ✅ Release completed successfully!                       ║${NC}"
  echo -e "${GREEN}║                                                            ║${NC}"
  echo -e "${GREEN}║   Time elapsed: ${minutes}m ${seconds}s                                     ║${NC}"
  echo -e "${GREEN}║                                                            ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  # Extract final version for display
  local version_info
  version_info=$(extract_version_info)
  local version_name="${version_info%|*}"
  local build_number="${version_info#*|}"

  echo "📲 Download links:"
  echo ""
  echo "  Android (Firebase):"
  echo "  https://appdistribution.firebase.dev/i/7b7ab3b30e627c35"
  echo ""
  echo "  iOS (Firebase):"
  echo "  https://appdistribution.firebase.dev/i/bdfa6517b69c31d6"
  echo ""
  echo "  iOS (TestFlight):"
  echo "  https://testflight.apple.com/join/v4bSIPad"
  echo ""
  echo "  Version: $version_name ($build_number)"
  echo ""

  # macOS notification sound
  command -v say &>/dev/null && say "done" || true
}

# Run main function
main "$@"
