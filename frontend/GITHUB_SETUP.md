# GitHub Setup for Android APK Build

## Step 1: Push to GitHub
Use the **"Save to Github"** button in Emergent to push your code.

## Step 2: Add GitHub Secrets
Go to your GitHub repository:
1. Click **Settings** (top menu)
2. Click **Secrets and variables** → **Actions** (left sidebar)
3. Click **New repository secret**

### Add these 4 secrets:

#### Secret 1: KEYSTORE_BASE64
```
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
```

#### Secret 2: KEYSTORE_PASSWORD
```
CanineCompass2026!
```

#### Secret 3: KEY_PASSWORD
```
CanineCompass2026!
```

#### Secret 4: KEY_ALIAS
```
caninecompass
```

## Step 3: Run the Build
1. Go to **Actions** tab in your repository
2. Click **Android Build** on the left
3. Click **Run workflow** (green button)
4. Select **main** branch
5. Click **Run workflow**

## Step 4: Download APK
1. Wait ~5 minutes for build to complete (green checkmark)
2. Click on the completed workflow run
3. Scroll down to **Artifacts** section
4. Download:
   - `app-debug` - For testing
   - `app-release-apk` - For distribution
   - `app-release-bundle` - For Play Store

## Troubleshooting

### "Secrets not found" error
Make sure you added all 4 secrets exactly as shown above.

### Build fails
Check the error logs in the Actions tab. Common issues:
- Missing secrets
- Typo in secret names (case-sensitive!)

## Need Help?
The workflow file is at: `.github/workflows/android-build.yml`
