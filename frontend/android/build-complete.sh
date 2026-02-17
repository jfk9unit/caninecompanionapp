#!/bin/bash
# ============================================================
# CanineCompass - Complete Android Build & Distribution Script
# ============================================================
# 
# This script will build both Debug and Release APKs
# Run this on a machine with Android Studio or Android SDK installed
#
# Requirements:
# - Java JDK 17+
# - Android SDK (or Android Studio)
# - At least 4GB RAM
# ============================================================

set -e

echo "=============================================="
echo "  CanineCompass Android Build Script"
echo "=============================================="
echo ""

# Check for Java
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java not found"
    echo "   Install Java JDK 17+ from: https://adoptium.net/"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ] 2>/dev/null; then
    echo "❌ Error: Java 17+ required. Found version: $JAVA_VERSION"
    exit 1
fi
echo "✅ Java: $(java -version 2>&1 | head -1)"

# Check for ANDROID_HOME or ANDROID_SDK_ROOT
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    # Try common locations
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "/usr/local/android-sdk" ]; then
        export ANDROID_HOME="/usr/local/android-sdk"
    else
        echo "❌ Error: Android SDK not found"
        echo "   Set ANDROID_HOME or ANDROID_SDK_ROOT environment variable"
        echo "   Or install Android Studio from: https://developer.android.com/studio"
        exit 1
    fi
fi
echo "✅ Android SDK: ${ANDROID_HOME:-$ANDROID_SDK_ROOT}"

# Navigate to script directory
cd "$(dirname "$0")"
echo "✅ Working directory: $(pwd)"
echo ""

# Step 1: Generate Keystore (if not exists)
echo "Step 1: Checking signing keystore..."
if [ ! -f "caninecompass-release.keystore" ]; then
    echo "   Generating new keystore..."
    keytool -genkey -v \
        -keystore caninecompass-release.keystore \
        -alias caninecompass \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass CanineCompass2026! \
        -keypass CanineCompass2026! \
        -dname "CN=CanineCompass, OU=Mobile Apps, O=CanineCompass Ltd, L=London, ST=England, C=GB"
    echo "✅ Keystore created!"
else
    echo "✅ Keystore already exists"
fi

# Step 2: Create keystore.properties
echo ""
echo "Step 2: Creating keystore.properties..."
cat > keystore.properties << EOF
storePassword=CanineCompass2026!
keyPassword=CanineCompass2026!
keyAlias=caninecompass
storeFile=caninecompass-release.keystore
EOF
echo "✅ keystore.properties created"

# Step 3: Clean previous builds
echo ""
echo "Step 3: Cleaning previous builds..."
./gradlew clean
echo "✅ Clean complete"

# Step 4: Build Debug APK
echo ""
echo "Step 4: Building Debug APK..."
./gradlew assembleDebug
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ Debug APK built successfully!"
    echo "   Location: app/build/outputs/apk/debug/app-debug.apk"
    DEBUG_SIZE=$(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
    echo "   Size: $DEBUG_SIZE"
else
    echo "❌ Debug APK build failed!"
fi

# Step 5: Build Release APK
echo ""
echo "Step 5: Building Release APK..."
./gradlew assembleRelease
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ Release APK built successfully!"
    echo "   Location: app/build/outputs/apk/release/app-release.apk"
    RELEASE_SIZE=$(ls -lh app/build/outputs/apk/release/app-release.apk | awk '{print $5}')
    echo "   Size: $RELEASE_SIZE"
else
    echo "❌ Release APK build failed!"
fi

# Step 6: Build Release AAB (for Play Store)
echo ""
echo "Step 6: Building Release AAB (for Play Store)..."
./gradlew bundleRelease
if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    echo "✅ Release AAB built successfully!"
    echo "   Location: app/build/outputs/bundle/release/app-release.aab"
    AAB_SIZE=$(ls -lh app/build/outputs/bundle/release/app-release.aab | awk '{print $5}')
    echo "   Size: $AAB_SIZE"
else
    echo "❌ Release AAB build failed!"
fi

# Summary
echo ""
echo "=============================================="
echo "  BUILD COMPLETE!"
echo "=============================================="
echo ""
echo "Output files:"
echo "  📱 Debug APK:   app/build/outputs/apk/debug/app-debug.apk"
echo "  📱 Release APK: app/build/outputs/apk/release/app-release.apk"
echo "  📦 Release AAB: app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "Next steps:"
echo "  1. Test APK on a device: adb install app/build/outputs/apk/debug/app-debug.apk"
echo "  2. Upload AAB to Google Play Console for publishing"
echo ""
echo "Play Store Console: https://play.google.com/console"
echo ""
