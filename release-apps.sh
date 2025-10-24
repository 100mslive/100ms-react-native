#!/bin/bash
#
# Release script for React Native Room Kit Example Apps
# Builds and distributes Android and iOS apps using Fastlane
#
# Usage: ./release-apps.sh [--android-only] [--ios-only] [--dry-run] [--no-commit]
#

set -e          # Exit on error
set -o pipefail # Catch errors in pipes

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}/packages/react-native-room-kit"
EXAMPLE_DIR="${PROJECT_DIR}/example"
BUILD_GRADLE="${EXAMPLE_DIR}/android/app/build.gradle"
IOS_PROJECT="${EXAMPLE_DIR}/ios/RNExample.xcodeproj"

# Build flags
BUILD_ANDROID=true
BUILD_IOS=true
DRY_RUN=false
SKIP_COMMIT=false

# ============================================================================
# COLORS AND LOGGING
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $(date '+%H:%M:%S') - $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $(date '+%H:%M:%S') - $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $(date '+%H:%M:%S') - $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $(date '+%H:%M:%S') - $1"
}

# ============================================================================
# CLEANUP AND ERROR HANDLING
# ============================================================================

cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    log_error "Script failed with exit code $exit_code"
    log_info "Cleaning up background processes..."
    jobs -p | xargs -r kill 2>/dev/null || true
  fi
}

trap cleanup EXIT

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

check_requirements() {
  log_info "Checking requirements..."

  local missing_tools=()

  command -v git >/dev/null 2>&1 || missing_tools+=("git")
  command -v npm >/dev/null 2>&1 || missing_tools+=("npm")
  command -v bundle >/dev/null 2>&1 || missing_tools+=("bundle (Ruby)")

  if [ "$BUILD_IOS" = true ]; then
    command -v pod >/dev/null 2>&1 || missing_tools+=("pod (CocoaPods)")
  fi

  if [ ${#missing_tools[@]} -ne 0 ]; then
    log_error "Missing required tools: ${missing_tools[*]}"
    exit 1
  fi

  log_success "All required tools are installed"
}

validate_directories() {
  log_info "Validating directory structure..."

  if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Project directory not found: $PROJECT_DIR"
    exit 1
  fi

  if [ ! -d "$EXAMPLE_DIR" ]; then
    log_error "Example directory not found: $EXAMPLE_DIR"
    exit 1
  fi

  if [ "$BUILD_ANDROID" = true ] && [ ! -d "${EXAMPLE_DIR}/android" ]; then
    log_error "Android directory not found: ${EXAMPLE_DIR}/android"
    exit 1
  fi

  if [ "$BUILD_IOS" = true ] && [ ! -d "${EXAMPLE_DIR}/ios" ]; then
    log_error "iOS directory not found: ${EXAMPLE_DIR}/ios"
    exit 1
  fi

  log_success "Directory structure validated"
}

check_git_status() {
  log_info "Checking git status..."

  pushd "$PROJECT_DIR" >/dev/null

  if [ "$DRY_RUN" = false ] && [ "$SKIP_COMMIT" = false ]; then
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
      log_warn "You have uncommitted changes"
      log_info "Uncommitted files:"
      git status --short
      read -p "Continue anyway? (y/N): " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Aborted by user"
        exit 0
      fi
    fi
  fi

  popd >/dev/null
}

# ============================================================================
# MAIN FUNCTIONS
# ============================================================================

perform_npm_actions() {
  log_info "Starting npm installation..."

  pushd "$PROJECT_DIR" >/dev/null

  log_info "Git pull in project directory..."
  if [ "$DRY_RUN" = false ]; then
    git pull --verbose || {
      log_error "Git pull failed"
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: git pull --verbose"
  fi

  log_info "Installing project dependencies..."
  if [ "$DRY_RUN" = false ]; then
    npm install || {
      log_error "npm install failed in project directory"
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: npm install"
  fi

  pushd example >/dev/null

  log_info "Installing example dependencies..."
  if [ "$DRY_RUN" = false ]; then
    npm install || {
      log_error "npm install failed in example directory"
      popd >/dev/null
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: npm install"
  fi

  popd >/dev/null
  popd >/dev/null

  log_success "npm actions completed"
  return 0
}

release_android() {
  log_info "Starting Android release..."

  pushd "${EXAMPLE_DIR}/android" >/dev/null

  log_info "Installing Ruby dependencies..."
  if [ "$DRY_RUN" = false ]; then
    bundle install --verbose || {
      log_error "bundle install failed for Android"
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: bundle install --verbose"
  fi

  log_info "Running Fastlane distribute_app for Android..."
  if [ "$DRY_RUN" = false ]; then
    bundle exec fastlane distribute_app || {
      log_error "Fastlane distribute_app failed for Android"
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: bundle exec fastlane distribute_app"
  fi

  popd >/dev/null

  log_success "Android release completed"
  return 0
}

release_ios() {
  log_info "Starting iOS release..."

  pushd "${EXAMPLE_DIR}/ios" >/dev/null

  log_info "Installing CocoaPods dependencies..."
  if [ "$DRY_RUN" = false ]; then
    pod install --verbose || {
      log_error "pod install failed"
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: pod install --verbose"
  fi

  log_info "Installing Ruby dependencies..."
  if [ "$DRY_RUN" = false ]; then
    bundle install --verbose || {
      log_error "bundle install failed for iOS"
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: bundle install --verbose"
  fi

  log_info "Running Fastlane distribute_app for iOS..."
  if [ "$DRY_RUN" = false ]; then
    bundle exec fastlane distribute_app || {
      log_error "Fastlane distribute_app failed for iOS"
      popd >/dev/null
      return 1
    }
  else
    log_info "[DRY RUN] Would run: bundle exec fastlane distribute_app"
  fi

  popd >/dev/null

  log_success "iOS release completed"
  return 0
}

get_android_version_info() {
  local build_gradle="$1"
  local version_code=""
  local version_name=""

  while IFS= read -r line; do
    if [[ $line =~ ^[[:space:]]*versionCode[[:space:]]+([0-9]+) ]]; then
      version_code="${BASH_REMATCH[1]}"
    elif [[ $line =~ ^[[:space:]]*versionName[[:space:]]+\"([0-9]+\.[0-9]+\.[0-9]+)\" ]]; then
      version_name="${BASH_REMATCH[1]}"
    fi
  done <"$build_gradle"

  if [ -z "$version_code" ] || [ -z "$version_name" ]; then
    log_error "Failed to parse version info from build.gradle"
    return 1
  fi

  echo "${version_name}:${version_code}"
  return 0
}

get_ios_version_info() {
  local info_plist="${EXAMPLE_DIR}/ios/RNExample/Info.plist"
  local version=""
  local build=""

  if [ ! -f "$info_plist" ]; then
    log_error "Info.plist not found at: $info_plist"
    return 1
  fi

  # Use /usr/libexec/PlistBuddy to read plist values (macOS built-in)
  if command -v /usr/libexec/PlistBuddy >/dev/null 2>&1; then
    version=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$info_plist" 2>/dev/null)
    build=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$info_plist" 2>/dev/null)
  else
    # Fallback: parse with grep/sed
    version=$(grep -A 1 "CFBundleShortVersionString" "$info_plist" | grep "<string>" | sed -E 's/.*<string>(.*)<\/string>.*/\1/' | tr -d '[:space:]')
    build=$(grep -A 1 "CFBundleVersion" "$info_plist" | grep "<string>" | sed -E 's/.*<string>(.*)<\/string>.*/\1/' | tr -d '[:space:]')
  fi

  if [ -z "$version" ] || [ -z "$build" ]; then
    log_error "Failed to get iOS version info from Info.plist"
    return 1
  fi

  echo "${version}:${build}"
  return 0
}

perform_git_actions() {
  log_info "Starting git actions..."

  pushd "$PROJECT_DIR" >/dev/null

  # Get version info after builds complete (Fastlane updates these during build)
  local android_version=""
  local ios_version=""
  local commit_message=""

  if [ "$BUILD_ANDROID" = true ]; then
    android_version=$(get_android_version_info "${BUILD_GRADLE}") || {
      log_error "Failed to get Android version info"
      popd >/dev/null
      return 1
    }
    log_info "Android version: $android_version"
  fi

  if [ "$BUILD_IOS" = true ]; then
    ios_version=$(get_ios_version_info) || {
      log_error "Failed to get iOS version info"
      popd >/dev/null
      return 1
    }
    log_info "iOS version: $ios_version"
  fi

  # Build commit message
  if [ "$BUILD_ANDROID" = true ] && [ "$BUILD_IOS" = true ]; then
    local android_ver="${android_version%:*}"
    local android_build="${android_version#*:}"
    commit_message="released sample apps - Android ${android_ver} (${android_build}) ⚛️"
  elif [ "$BUILD_ANDROID" = true ]; then
    local android_ver="${android_version%:*}"
    local android_build="${android_version#*:}"
    commit_message="released sample app - Android ${android_ver} (${android_build}) 🤖"
  elif [ "$BUILD_IOS" = true ]; then
    local ios_ver="${ios_version%:*}"
    local ios_build="${ios_version#*:}"
    commit_message="released sample app - iOS ${ios_ver} (${ios_build}) 🍎"
  fi

  log_info "Staging changed files..."
  if [ "$DRY_RUN" = false ]; then
    # Add Android files if built
    if [ "$BUILD_ANDROID" = true ]; then
      git add example/android/app/build.gradle 2>/dev/null || log_warn "No changes in Android build.gradle"
    fi

    # Add iOS files if built
    if [ "$BUILD_IOS" = true ]; then
      git add example/ios/Podfile.lock 2>/dev/null || log_warn "No changes in Podfile.lock"
      git add example/ios/RNExample/Info.plist 2>/dev/null || log_warn "No changes in Info.plist"
      git add example/ios/RNExample.xcodeproj/project.pbxproj 2>/dev/null || log_warn "No changes in project.pbxproj"
    fi

    # Check if there are staged changes
    if git diff --cached --quiet; then
      log_warn "No changes to commit"
    else
      log_info "Committing changes..."
      git commit -m "$commit_message" || {
        log_error "Git commit failed"
        popd >/dev/null
        return 1
      }

      log_info "Pushing to remote..."
      git push --verbose || {
        log_error "Git push failed"
        popd >/dev/null
        return 1
      }
    fi
  else
    log_info "[DRY RUN] Would commit: $commit_message"
    log_info "[DRY RUN] Would push to remote"
  fi

  popd >/dev/null

  log_success "Git actions completed"
  return 0
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case $1 in
    --android-only)
      BUILD_IOS=false
      log_info "Building Android only"
      shift
      ;;
    --ios-only)
      BUILD_ANDROID=false
      log_info "Building iOS only"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      log_info "Dry run mode enabled"
      shift
      ;;
    --no-commit)
      SKIP_COMMIT=true
      log_info "Skipping git commit"
      shift
      ;;
    -h | --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --android-only    Build and release Android only"
      echo "  --ios-only        Build and release iOS only"
      echo "  --dry-run         Show what would be done without executing"
      echo "  --no-commit       Skip git commit and push"
      echo "  -h, --help        Show this help message"
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
    esac
  done
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  log_info "=========================================="
  log_info "React Native Room Kit Release Script"
  log_info "=========================================="
  echo ""

  # Parse command line arguments
  parse_arguments "$@"

  # Pre-flight checks
  check_requirements
  validate_directories
  check_git_status

  echo ""
  log_info "Starting release process..."
  echo ""

  # Step 1: Perform npm actions in background
  log_info "[1/4] Running npm install..."
  perform_npm_actions &
  npm_pid=$!

  # Wait for npm actions to complete
  if ! wait $npm_pid; then
    log_error "npm actions failed"
    exit 1
  fi

  echo ""
  log_info "[2/4] Building and distributing apps..."
  echo ""

  # Step 2: Build and release Android & iOS in parallel
  local android_pid=""
  local ios_pid=""

  if [ "$BUILD_ANDROID" = true ]; then
    release_android &
    android_pid=$!
    log_info "Android build started (PID: $android_pid)"
  fi

  if [ "$BUILD_IOS" = true ]; then
    release_ios &
    ios_pid=$!
    log_info "iOS build started (PID: $ios_pid)"
  fi

  # Wait for builds to complete
  local build_failed=false

  if [ -n "$android_pid" ]; then
    if ! wait $android_pid; then
      log_error "Android build failed"
      build_failed=true
    fi
  fi

  if [ -n "$ios_pid" ]; then
    if ! wait $ios_pid; then
      log_error "iOS build failed"
      build_failed=true
    fi
  fi

  if [ "$build_failed" = true ]; then
    log_error "One or more builds failed"
    exit 1
  fi

  echo ""
  log_info "[3/4] All builds completed successfully"
  echo ""

  # Step 3: Perform git actions
  if [ "$SKIP_COMMIT" = false ]; then
    log_info "[4/4] Committing and pushing changes..."
    perform_git_actions || {
      log_error "Git actions failed"
      exit 1
    }
  else
    log_info "[4/4] Skipping git commit (--no-commit flag)"
  fi

  echo ""
  log_success "=========================================="
  log_success "Release completed successfully! 🎉"
  log_success "=========================================="

  # Optional: macOS voice notification
  if command -v say >/dev/null 2>&1; then
    say "Release completed" &
  fi
}

# Run main function
main "$@"
