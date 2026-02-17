# CanineCompass iOS Build Guide

## Overview
This guide explains how to build CanineCompass for iOS and submit to the Apple App Store.

## Prerequisites
- **Mac computer** (required for iOS development)
- **Xcode 15+** (from Mac App Store)
- **Apple Developer Account** ($99/year)
- Node.js 18+
- Yarn package manager
- CocoaPods (`sudo gem install cocoapods`)

## Project Structure
```
ios/
├── App/
│   ├── App/
│   │   ├── public/           # Built web app
│   │   ├── Info.plist        # App configuration
│   │   ├── AppDelegate.swift
│   │   └── Assets.xcassets/  # App icons
│   ├── App.xcodeproj/        # Xcode project
│   └── Podfile               # CocoaPods dependencies
├── appstore-assets/          # App Store screenshots
├── APP_STORE_LISTING.md      # Store listing content
└── README.md                 # This file
```

## Quick Start

### 1. Build Web App
```bash
cd frontend
yarn build
```

### 2. Sync with iOS
```bash
yarn ios:sync
# or
npx cap sync ios
```

### 3. Install CocoaPods
```bash
cd ios/App
pod install
```

### 4. Open in Xcode
```bash
yarn ios:open
# or
npx cap open ios
```

### 5. Configure Signing
1. In Xcode, select the "App" target
2. Go to "Signing & Capabilities"
3. Select your Team
4. Let Xcode manage signing automatically

### 6. Run on Device/Simulator
- Select your device or simulator
- Press ⌘R or click "Run"

## Building for App Store

### Archive Build
1. In Xcode: Product > Archive
2. Wait for build to complete
3. Organizer window opens automatically

### Upload to App Store Connect
1. In Organizer, select the archive
2. Click "Distribute App"
3. Select "App Store Connect"
4. Follow the wizard to upload

### TestFlight Beta Testing
1. Go to App Store Connect
2. Select your app > TestFlight
3. Add internal/external testers
4. Testers receive invitation email

### Submit for Review
1. In App Store Connect > App Store
2. Fill in version information
3. Add screenshots and description
4. Select build from uploaded archives
5. Submit for review

## App Configuration

### Bundle Identifier
Edit in Xcode or `capacitor.config.ts`:
```typescript
appId: 'com.caninecompass.app'
```

### Version Number
In Xcode:
- Version (CFBundleShortVersionString): 1.0.0
- Build (CFBundleVersion): 1

### App Icons
Replace icons in `App/App/Assets.xcassets/AppIcon.appiconset/`:

| Size | Filename | Use |
|------|----------|-----|
| 20x20 | icon-20.png | iPad Notifications |
| 29x29 | icon-29.png | Settings |
| 40x40 | icon-40.png | Spotlight |
| 60x60 | icon-60.png | iPhone App |
| 76x76 | icon-76.png | iPad App |
| 83.5x83.5 | icon-83.5.png | iPad Pro App |
| 1024x1024 | icon-1024.png | App Store |

### Launch Screen
Edit `App/App/Base.lproj/LaunchScreen.storyboard` in Xcode

## Permissions

Configured in `Info.plist`:

| Permission | Key | Description |
|------------|-----|-------------|
| Camera | NSCameraUsageDescription | Dog photos |
| Photo Library | NSPhotoLibraryUsageDescription | Select photos |
| Save Photos | NSPhotoLibraryAddUsageDescription | Save photos |
| Location | NSLocationWhenInUseUsageDescription | Find trainers |
| Push Notifications | UIBackgroundModes | Training reminders |

## Troubleshooting

### Build Errors

**"No signing certificate"**
1. Open Xcode Preferences > Accounts
2. Add your Apple ID
3. Download certificates

**"Pod install failed"**
```bash
cd ios/App
pod repo update
pod install
```

**"Web assets not found"**
```bash
cd frontend
yarn build
npx cap sync ios
```

### Simulator Issues

**"Unable to boot simulator"**
1. Xcode > Window > Devices and Simulators
2. Delete problematic simulator
3. Create new simulator

**"App crashes on launch"**
1. Check console logs in Xcode
2. Verify web build is correct
3. Check Info.plist configuration

### Code Signing Issues

**"Provisioning profile not found"**
1. Xcode > Preferences > Accounts
2. Download manual profiles
3. Or enable "Automatically manage signing"

## Testing

### Unit Tests
```bash
cd ios/App
xcodebuild test -scheme App -destination 'platform=iOS Simulator,name=iPhone 15'
```

### UI Tests
Create UI tests in Xcode under App/AppUITests/

### Manual Testing Checklist
- [ ] App launches correctly
- [ ] Login/signup works
- [ ] Training lessons play
- [ ] Equipment shop checkout
- [ ] Trainer booking flow
- [ ] Push notifications received
- [ ] Offline mode functions
- [ ] Deep links work

## Release Checklist

### Before Archive
- [ ] Update version and build numbers
- [ ] Test on physical device
- [ ] Check all features work
- [ ] Review crash logs
- [ ] Update screenshots if needed

### App Store Connect
- [ ] Create new version
- [ ] Upload build
- [ ] Add release notes
- [ ] Submit screenshots
- [ ] Fill in all metadata

### Post-Release
- [ ] Monitor crash reports
- [ ] Respond to reviews
- [ ] Plan next update

## Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Support

For build issues: support@caninecompass.app
