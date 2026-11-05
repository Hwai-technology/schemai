#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Default release type is minor (e.g. 0.0.12 -> 0.1.0) or user-specified (patch/minor/major)
RELEASE_TYPE=${1:-minor}

# Load environment variables from .env file if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Starting SchemAI Extension Release process ($RELEASE_TYPE)..."

# 1. Run full test suite & compile before bumping version
echo "🧪 Running tests and compiling TypeScript..."
npm test

# Auto-stage pending modifications so npm version never fails on dirty tree
if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Staging pending working tree changes before version bump..."
    git add -A
    git commit -m "chore: save working changes before release" || true
fi

# 2. Bump version using npm (updates package.json & creates a git tag)
echo "📦 Updating version number ($RELEASE_TYPE)..."
NEW_VERSION=$(npm version $RELEASE_TYPE -m "release: v%s")
echo "📌 New Version: $NEW_VERSION"

# 3. Package the extension into VSIX
echo "🛠️ Packaging extension VSIX..."
npx vsce package --allow-missing-repository

# 4. Publish to Open VSX Registry if token is provided
if [ -n "$OVSX_PAT" ]; then
    echo "🌐 Publishing to Open VSX directly..."
    npx ovsx publish -p "$OVSX_PAT" || echo "⚠️ Open VSX: upload skipped or version already published."
else
    echo "ℹ️ OVSX_PAT environment variable not set locally."
    echo "   (GitHub Actions CI/CD will publish automatically if OVSX_PAT secret is configured on GitHub)."
fi

# 5. Push code & tags to GitHub
echo "⬆️ Pushing changes & tags to GitHub (origin main --tags)..."
git push origin main --tags

echo "🎉 Release $NEW_VERSION completed and pushed successfully!"
