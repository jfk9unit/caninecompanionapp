# Build CanineCompass Android APK Locally

## Prerequisites
1. Android Studio installed
2. Java JDK 17+
3. Node.js 18+ and Yarn

## Quick Build Steps

### Option 1: Using Android Studio (Recommended)
1. Open Android Studio
2. File > Open > Select the `android` folder
3. Wait for Gradle sync to complete
4. Build > Build Bundle(s) / APK(s) > Build APK(s)
5. Find APK in: `android/app/build/outputs/apk/release/`

### Option 2: Command Line
```bash
cd android
./gradlew assembleRelease
```

### Option 3: Full Build from Source
```bash
# Install dependencies
yarn install

# Build web app (if not already built)
yarn build

# Sync to Android
npx cap sync android

# Build APK
cd android
./gradlew assembleRelease
```

## Output Files
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Signing Key
The signing keystore is included:
- File: `android/caninecompass-release.keystore`
- Alias: `caninecompass`
- Password: `CanineCompass2026!`

⚠️ For production, generate your own keystore!
