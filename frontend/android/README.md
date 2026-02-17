# CanineCompass Android App

## Quick Start

### Prerequisites
1. [Android Studio](https://developer.android.com/studio) (latest version)
2. Java JDK 17+ 
3. Node.js 18+
4. Yarn package manager

### Build Commands
```bash
# From the frontend directory:

# Build web + sync to Android
yarn android:build

# Just sync (if web already built)
yarn android:sync

# Open in Android Studio
yarn android:open
```

### One-Click Release Build
```bash
cd android
./build-release.sh
```

This script will:
1. Generate signing keystore (if not exists)
2. Build the React web app
3. Sync to Android
4. Build release APK
5. Build release AAB (for Play Store)

## Project Files

```
android/
├── app/
│   ├── src/main/
│   │   ├── assets/public/     # Built web app (auto-generated)
│   │   ├── res/
│   │   │   ├── drawable/      # Splash screen
│   │   │   ├── mipmap-*/      # App icons (multiple sizes)
│   │   │   ├── values/        # Colors, strings, styles
│   │   │   └── xml/           # Network config
│   │   └── AndroidManifest.xml
│   └── build.gradle           # App-level build config
├── build.gradle               # Project-level build config
├── playstore-assets/          # Play Store listing images
│   ├── app_icon_512.png       # 512x512 app icon
│   ├── feature_graphic.png    # 1024x500 feature graphic
│   └── screenshot_*.png       # App screenshots
├── build-release.sh           # One-click build script
├── keystore.properties.template  # Signing config template
├── PLAY_STORE_LISTING.md      # Store listing content
└── README.md                  # This file
```

## Build Outputs

After running `./build-release.sh`:

| File | Location | Use |
|------|----------|-----|
| Debug APK | `app/build/outputs/apk/debug/app-debug.apk` | Testing |
| Release APK | `app/build/outputs/apk/release/app-release.apk` | Direct install |
| Release AAB | `app/build/outputs/bundle/release/app-release.aab` | Play Store |

## Signing Configuration

### First Time Setup
1. Run `./build-release.sh` - it will generate keystore automatically
2. Or manually create:
```bash
keytool -genkey -v \
  -keystore caninecompass-release.keystore \
  -alias caninecompass \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Keystore Security
⚠️ **IMPORTANT**: Keep your keystore file safe!
- Never commit to git
- Back up securely
- Same keystore required for all future updates

## Play Store Submission

### Required Files
1. **Release AAB**: `app/build/outputs/bundle/release/app-release.aab`
2. **App Icon**: `playstore-assets/app_icon_512.png`
3. **Feature Graphic**: `playstore-assets/feature_graphic.png`
4. **Screenshots**: `playstore-assets/screenshot_*.png`

### Store Listing
See `PLAY_STORE_LISTING.md` for:
- App descriptions
- Keywords
- Privacy policy
- Release notes

### Submission Steps
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in store listing (use PLAY_STORE_LISTING.md)
4. Upload AAB file
5. Complete content rating questionnaire
6. Set pricing & distribution
7. Submit for review

## Testing

### Debug Build
```bash
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### On Device Testing
1. Enable USB debugging on device
2. Connect via USB
3. Run: `npx cap run android`

### Emulator Testing
1. Open Android Studio
2. Tools > Device Manager
3. Create virtual device
4. Run app

## Troubleshooting

### Build Fails
```bash
./gradlew clean
./gradlew build --stacktrace
```

### Web Assets Not Updating
```bash
cd ..
yarn build
npx cap sync android
```

### Signing Issues
```bash
# Verify keystore
keytool -list -v -keystore caninecompass-release.keystore
```

### SDK Issues
Open Android Studio > Tools > SDK Manager > Install required SDK versions

## App Configuration

### Change App ID
Edit `app/build.gradle`:
```gradle
applicationId "com.caninecompass.app"
```

### Change Version
Edit `app/build.gradle`:
```gradle
versionCode 2        // Increment for each release
versionName "1.1.0"  // User-visible version
```

### Change Colors
Edit `app/src/main/res/values/colors.xml`:
```xml
<color name="colorPrimary">#22c55e</color>
```

## Support

- Documentation: See `ANDROID_BUILD.md` in parent directory
- Issues: support@caninecompass.app
