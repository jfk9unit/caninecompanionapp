#!/bin/bash
# CanineCompass Android Release Build Script
# Run this script on your local machine with Java JDK and Android Studio installed

echo "=========================================="
echo "CanineCompass Android Release Build"
echo "=========================================="
echo ""

# Check for Java
if ! command -v keytool &> /dev/null; then
    echo "ERROR: Java JDK not found. Please install Java JDK 17+"
    echo "Download from: https://adoptium.net/"
    exit 1
fi

# Step 1: Generate Keystore (if not exists)
if [ ! -f "caninecompass-release.keystore" ]; then
    echo "Step 1: Generating release keystore..."
    keytool -genkey -v \
        -keystore caninecompass-release.keystore \
        -alias caninecompass \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass caninecompass2026 \
        -keypass caninecompass2026 \
        -dname "CN=CanineCompass, OU=Mobile, O=CanineCompass Ltd, L=London, ST=England, C=GB"
    echo "✅ Keystore created!"
else
    echo "Step 1: Keystore already exists ✅"
fi

# Step 2: Create keystore.properties
echo ""
echo "Step 2: Creating keystore.properties..."
cat > keystore.properties << EOF
storePassword=caninecompass2026
keyPassword=caninecompass2026
keyAlias=caninecompass
storeFile=caninecompass-release.keystore
EOF
echo "✅ keystore.properties created!"

# Step 3: Build web app
echo ""
echo "Step 3: Building web app..."
cd ..
yarn build
if [ $? -ne 0 ]; then
    echo "ERROR: Web build failed!"
    exit 1
fi
echo "✅ Web app built!"

# Step 4: Sync with Capacitor
echo ""
echo "Step 4: Syncing with Android..."
npx cap sync android
echo "✅ Android synced!"

# Step 5: Build Release APK
echo ""
echo "Step 5: Building Release APK..."
cd android
./gradlew assembleRelease
if [ $? -ne 0 ]; then
    echo "ERROR: APK build failed!"
    exit 1
fi
echo "✅ Release APK built!"

# Step 6: Build Release AAB (for Play Store)
echo ""
echo "Step 6: Building Release AAB for Play Store..."
./gradlew bundleRelease
if [ $? -ne 0 ]; then
    echo "ERROR: AAB build failed!"
    exit 1
fi
echo "✅ Release AAB built!"

echo ""
echo "=========================================="
echo "BUILD COMPLETE!"
echo "=========================================="
echo ""
echo "Output files:"
echo "  APK: app/build/outputs/apk/release/app-release.apk"
echo "  AAB: app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "Next steps:"
echo "1. Test the APK on a device"
echo "2. Upload AAB to Google Play Console"
echo "3. Fill in store listing details"
echo ""
