#!/usr/bin/env bash
# Setup script to add CO-AUG Dashboard as a git submodule

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Adding CO-AUG Dashboard as git submodule..."
echo ""

# Check if co-aug-dashboard directory already exists
if [ -d "co-aug-dashboard" ]; then
  echo "⚠️  co-aug-dashboard directory already exists"
  read -p "Remove it and re-add as submodule? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing existing directory..."
    rm -rf co-aug-dashboard
  else
    echo "Aborted. Please remove co-aug-dashboard directory manually if you want to proceed."
    exit 1
  fi
fi

# Add the submodule
echo "Adding submodule..."
git submodule add https://github.com/node-dojo/co-aug-dashboard.git co-aug-dashboard

echo ""
echo "✅ Dashboard submodule added successfully!"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git status"
echo "  2. Commit the submodule: git commit -m 'Add co-aug-dashboard as submodule'"
echo "  3. The dashboard is now available at: solvet-global/co-aug-dashboard/"
echo ""
echo "To update the submodule later:"
echo "  git submodule update --remote co-aug-dashboard"


