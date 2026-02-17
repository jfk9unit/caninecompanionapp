# CanineCompass - Google Play Store TWA Setup Guide

## Overview
This guide will help you publish CanineCompass as an Android app on Google Play Store using Trusted Web Activity (TWA).

---

## Prerequisites

1. **Google Play Developer Account** - $25 one-time fee
   - Sign up at: https://play.google.com/console/signup

2. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/

3. **Java JDK 11+**
   - Download: https://adoptium.net/

4. **Android SDK** (or Android Studio)
   - Download: https://developer.android.com/studio

---

## Step 1: Install Bubblewrap CLI

```bash
npm install -g @anthropic/anthropic-bedrock-sdknpm install -g @anthropic/sdknpm install -g @anthropic/tokenizernpm install -g @anthropic/vertex-sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm i -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm i -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @anthropic/sdknpm install -g @bubblewrap/cli
```

---

## Step 2: Initialize TWA Project

Create a new directory and initialize:

```bash
mkdir caninecompass-twa
cd caninecompass-twa
bubblewrap init --manifest https://pet-token-world.preview.emergentagent.com/manifest.json
```

When prompted:
- **Package ID**: com.caninecompass.app
- **App Name**: CanineCompass
- **Display Mode**: standalone
- **Status Bar Color**: #22c55e
- **Splash Background**: #ffffff

---

## Step 3: Generate Signing Key

```bash
keytool -genkey -v -keystore android.keystore -alias caninecompass -keyalg RSA -keysize 2048 -validity 10000
```

Save your keystore password securely - you need it for all future updates!

---

## Step 4: Get SHA256 Fingerprint

```bash
keytool -list -v -keystore android.keystore -alias caninecompass
```

Copy the SHA256 fingerprint and update assetlinks.json

---

## Step 5: Build APK/AAB

```bash
bubblewrap build
```

This generates:
- app-release-bundle.aab (for Play Store)
- app-release-signed.apk (for testing)

---

## Step 6: Upload to Play Store

1. Go to Google Play Console
2. Create New App
3. Complete Store Listing
4. Upload AAB file
5. Submit for review

---

## Alternative: PWABuilder

For a simpler process:
1. Go to https://www.pwabuilder.com/
2. Enter URL: https://pet-token-world.preview.emergentagent.com
3. Click Start > Android
4. Download and follow instructions

---

## Support
- App Support: support@caninecompass.app
- Legal: legal@caninecompass.app
