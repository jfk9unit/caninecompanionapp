# CanineCompass Android Build Guide

## Overview
This guide explains how to build CanineCompass as an Android APK for distribution on Google Play Store or direct installation.

## Prerequisites
- Android Studio (latest version)
- Java JDK 17 or higher
- Node.js 18+
- Yarn package manager

## Project Structure
```
frontend/
├── android/                 # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/public/  # Built web app
│   │   │   ├── res/            # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── capacitor.config.ts      # Capacitor configuration
├── public/                  # PWA assets
└── src/                     # React source code
```

## Quick Build Steps

### 1. Build the Web App
```bash
cd frontend
yarn build
```

### 2. Sync with Android
```bash
npx cap sync android
```

### 3. Open in Android Studio
```bash
npx cap open android
```

### 4. Build APK/AAB
In Android Studio:
- **Debug APK**: Build > Build Bundle(s) / APK(s) > Build APK(s)
- **Release AAB** (for Play Store): Build > Generate Signed Bundle / APK

## Detailed Instructions

### Setting Up Signing Keys (Required for Release)
1. Generate a keystore:
```bash
keytool -genkey -v -keystore caninecompass-release.keystore -alias caninecompass -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/keystore.properties`:
```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=caninecompass
storeFile=../caninecompass-release.keystore
```

3. Update `android/app/build.gradle` to use signing config (already configured)

### Building Release APK
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### Building Release AAB (for Play Store)
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

## App Configuration

### App ID & Version
Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.caninecompass.app"
        versionCode 1
        versionName "1.0.0"
    }
}
```

### App Icons
Replace icons in these folders:
- `android/app/src/main/res/mipmap-mdpi/` (48x48)
- `android/app/src/main/res/mipmap-hdpi/` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/` (192x192)

### Splash Screen
Replace `android/app/src/main/res/drawable/splash.png`

## PWA Installation (Alternative)
Users can also install CanineCompass directly from the browser:
1. Open https://your-domain.com in Chrome on Android
2. Tap the menu (3 dots)
3. Select "Add to Home Screen"
4. The app will install with offline support

## Google Play Store Submission

### Required Assets
- App Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: At least 2 phone screenshots
- Short Description: Max 80 characters
- Full Description: Max 4000 characters

### Pre-launch Checklist
- [ ] Test on multiple Android versions (8.0+)
- [ ] Test offline functionality
- [ ] Test all payment flows
- [ ] Verify deep links work
- [ ] Check permissions are minimal
- [ ] Review privacy policy URL
- [ ] Set up Play Console account

## Troubleshooting

### Build Fails
```bash
cd android
./gradlew clean
./gradlew build
```

### Web Assets Not Updating
```bash
yarn build
npx cap sync android
```

### Capacitor Plugin Issues
```bash
npx cap update android
```

## Support
For issues, contact: support@caninecompass.app
