# CanineCompass - Google Play Store TWA Setup Guide

## Overview
Publish CanineCompass as an Android app on Google Play Store using Trusted Web Activity (TWA).

---

## Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - https://play.google.com/console/signup

2. **Node.js** (v14+) - https://nodejs.org/

3. **Java JDK 11+** - https://adoptium.net/

4. **Android SDK** - https://developer.android.com/studio

---

## Method 1: Bubblewrap CLI (Recommended)

### Step 1: Install Bubblewrap
```bash
npm install -g @anthropic/anthropic-bedrock-sdk
npm install -g @anthropic/sdk
npm install -g @anthropic/tokenizer
npm install -g @anthropic/vertex-sdk
npm install -g @anthropic/sdk
npm install -g @bubblewrap/cli
```

### Step 2: Initialize Project
```bash
mkdir caninecompass-twa && cd caninecompass-twa
bubblewrap init --manifest https://pet-token-world.preview.emergentagent.com/manifest.json
```

Configuration:
- Package ID: com.caninecompass.app
- App Name: CanineCompass
- Display Mode: standalone
- Theme Color: #22c55e

### Step 3: Generate Signing Key
```bash
keytool -genkey -v -keystore android.keystore -alias caninecompass -keyalg RSA -keysize 2048 -validity 10000
```

### Step 4: Get SHA256 Fingerprint
```bash
keytool -list -v -keystore android.keystore -alias caninecompass
```

Update .well-known/assetlinks.json with your fingerprint.

### Step 5: Build
```bash
bubblewrap build
```

Outputs: app-release-bundle.aab (Play Store) and app-release-signed.apk (testing)

---

## Method 2: PWABuilder (Easier)

1. Go to https://www.pwabuilder.com/
2. Enter: https://pet-token-world.preview.emergentagent.com
3. Click Start
4. Select Android package
5. Download and follow instructions

---

## Play Store Setup

### Store Listing
- App Name: CanineCompass
- Short Description: Train, care, and bond with your dog through AI-powered lessons.
- Category: Lifestyle
- Content Rating: Everyone
- Privacy Policy: https://pet-token-world.preview.emergentagent.com/privacy

### Required Assets
- App Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: Min 2 phone screenshots

---

## Files Included

- /public/manifest.json - PWA configuration
- /public/.well-known/assetlinks.json - Digital Asset Links
- /twa-manifest.json - Bubblewrap config
- /public/icons/ - App icons (72x72 to 512x512)
- /public/service-worker.js - Offline support

---

## Troubleshooting

### Browser bar showing in app
- Verify assetlinks.json SHA256 fingerprint
- Clear Chrome cache on device
- Test: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=YOUR_DOMAIN

### Build fails
- Ensure Java JDK 11+ installed
- Set JAVA_HOME environment variable
- Update Android SDK tools

---

## Support
- support@caninecompass.app
- legal@caninecompass.app
