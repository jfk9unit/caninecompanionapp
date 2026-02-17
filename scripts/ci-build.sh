#!/usr/bin/env bash
set -euo pipefail
# CI/local helper: builds signed release APK/AAB.
# Required env vars: KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR/frontend"

npm ci
npm run build

if [ -n "${KEYSTORE_BASE64:-}" ]; then
  mkdir -p android/app
  echo "$KEYSTORE_BASE64" | base64 -d > android/app/keystore.jks
fi

cat > android/keystore.properties <<EOF
storeFile=keystore.jks
storePassword=${KEYSTORE_PASSWORD}
keyAlias=${KEY_ALIAS}
keyPassword=${KEY_PASSWORD}
EOF

npx cap sync android

cd android
chmod +x ./gradlew
./gradlew assembleRelease

echo "Build finished. APKs are in frontend/android/app/build/outputs/apk/release/"
