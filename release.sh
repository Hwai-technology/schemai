#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Default release type is patch (0.0.1 -> 0.0.2)
RELEASE_TYPE=${1:-patch}

# Load environment variables from .env file if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Starting SchemAI Extension Release process ($RELEASE_TYPE)..."

# 1. Bump version using npm (updates package.json & creates a git tag)
echo "📦 Updating version number..."
npm version $RELEASE_TYPE

# 2. Package the extension into VSIX
echo "🛠️ Packaging extension VSIX..."
npx vsce package --allow-missing-repository

# 3. Publish to Open VSX Registry if token is provided
if [ -n "$OVSX_PAT" ]; then
    echo "🌐 Publishing to Open VSX..."
    npx ovsx publish -p "$OVSX_PAT"
else
    echo "⚠️ OVSX_PAT environment variable not set. Skipping publication to Open VSX."
    echo "   To publish automatically, set OVSX_PAT or pass your token: OVSX_PAT=your_token ./release.sh"
fi

# 4. Push code & tags to GitHub
echo "⬆️ Pushing changes & tags to GitHub..."
git push origin main --tags

echo "✅ Release completed successfully!"
