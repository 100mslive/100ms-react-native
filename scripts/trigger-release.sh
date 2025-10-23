#!/bin/bash
#
# Trigger GitHub Actions Release Workflow
#
# This script triggers the automated release workflow on GitHub Actions.
# This is the RECOMMENDED way to release apps as it provides:
#   - Proper secrets management via GitHub Secrets
#   - Full audit trail via GitHub Actions logs
#   - No local setup required
#   - Consistent, reproducible builds
#
# Prerequisites:
#   - GitHub CLI (gh) installed: https://cli.github.com/
#   - Authenticated with GitHub: gh auth login
#
# Usage:
#   ./scripts/trigger-release.sh           # Trigger on current branch
#   ./scripts/trigger-release.sh release   # Trigger on release branch
#

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
REPO_ROOT="$(git rev-parse --show-toplevel)"
CHANGELOG_FILE="$REPO_ROOT/packages/react-native-room-kit/example/ExampleAppChangelog.txt"
WORKFLOW_NAME="release_apps.yml"
DEFAULT_BRANCH="release"

# Parse arguments
BRANCH="${1:-$DEFAULT_BRANCH}"

# Check if gh is installed
if ! command -v gh &>/dev/null; then
  echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
  echo ""
  echo "Please install it from: https://cli.github.com/"
  echo ""
  echo "On macOS:"
  echo "  brew install gh"
  echo ""
  exit 1
fi

# Check if authenticated
if ! gh auth status &>/dev/null; then
  echo -e "${RED}Error: Not authenticated with GitHub${NC}"
  echo ""
  echo "Please run: gh auth login"
  echo ""
  exit 1
fi

# Banner
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║   Trigger GitHub Actions Release Workflow                 ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate changelog was updated
if [[ ! -f $CHANGELOG_FILE ]]; then
  echo -e "${RED}Error: Changelog file not found${NC}"
  echo "Expected: $CHANGELOG_FILE"
  exit 1
fi

changelog_age=$(($(date +%s) - $(stat -f %m "$CHANGELOG_FILE" 2>/dev/null || stat -c %Y "$CHANGELOG_FILE")))
if [[ $changelog_age -gt 86400 ]]; then
  echo -e "${YELLOW}⚠ Warning: Changelog was last modified more than 24 hours ago${NC}"
  echo ""
  echo "Last modified: $(stat -f %Sm "$CHANGELOG_FILE" 2>/dev/null || stat -c %y "$CHANGELOG_FILE")"
  echo ""
  read -p "Continue anyway? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

# Show changelog preview
echo -e "${BLUE}Current changelog:${NC}"
echo "────────────────────────────────────────────────────────────"
head -15 "$CHANGELOG_FILE"
echo "────────────────────────────────────────────────────────────"
echo ""

# Confirm
echo -e "${YELLOW}This will trigger the release workflow on branch: ${BRANCH}${NC}"
echo ""
echo "The workflow will:"
echo "  • Build Android and iOS apps"
echo "  • Distribute to Firebase App Distribution"
echo "  • Upload iOS to TestFlight"
echo "  • Send Slack notifications"
echo ""
read -p "Continue? [y/N] " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

# Trigger workflow
echo -e "${BLUE}Triggering workflow on branch: ${BRANCH}...${NC}"

if gh workflow run "$WORKFLOW_NAME" --ref "$BRANCH"; then
  echo ""
  echo -e "${GREEN}✅ Workflow triggered successfully!${NC}"
  echo ""
  echo "Monitor the workflow at:"
  echo -e "${BLUE}https://github.com/100mslive/100ms-react-native/actions${NC}"
  echo ""
  echo "Or run:"
  echo "  gh run list --workflow=$WORKFLOW_NAME"
  echo "  gh run watch"
  echo ""
else
  echo ""
  echo -e "${RED}Failed to trigger workflow${NC}"
  exit 1
fi
