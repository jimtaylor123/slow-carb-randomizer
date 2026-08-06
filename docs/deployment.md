# Deployment

The app is a Next.js **static export** (`out/`) that can be hosted anywhere, installed as a PWA,
or wrapped with **Capacitor 8** and shipped to the App Store and Google Play.

## 1. Web (any static host)

```bash
npm run build    # writes out/
```

Host `out/` on Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront, etc. The result
is a fully offline-capable PWA (manifest + icons are in `public/`).

## 2. Native apps (Capacitor)

Prerequisites: Node 20+, **Xcode** (macOS only, iOS), **Android Studio** (Android), plus paid
developer accounts (below).

### Workflow

```bash
npm run mobile        # next build → out/, then cap sync into ios/ and android/
npm run mobile:ios    # opens the Xcode workspace
npm run mobile:android  # opens the Android project
```

The native projects (`ios/`, `android/`) are committed so shell changes (permissions, icons,
signing) are version-controlled. Build artifacts are gitignored.

`capacitor.config.ts` summary:

```ts
{
  appId: "com.jimtaylor.slowcarbrandomizer",
  appName: "Slow Carb Randomizer",
  webDir: "out",
  backgroundColor: "#09090b",
}
```

### iOS: TestFlight → App Store

1. Apple Developer Program (**$99/yr**).
2. In Xcode: set **Signing Team**, bump build number per upload.
3. The app uses `@capacitor/motion`; add `NSMotionUsageDescription` to `ios/App/App/Info.plist`
   (a human-readable reason for motion access).
4. Product ▸ Archive, then distribute to **TestFlight** (internal first), then App Store.
5. Provide required metadata: 1024×1024 icon (see `public/icon-512.png` for a source), screenshots,
   privacy policy URL.

### Android: Internal testing → Play Store

1. Google Play Console (**$25** one-time).
2. Generate a signing keystore; build a signed **App Bundle (AAB)**:
   `cd android && ./gradlew bundleRelease`.
3. Upload to the **Internal testing** track first (instant availability), then promote to
   Production.
4. Increment `versionCode` in `android/app/build.gradle` on every upload.

### Release checklist

- [ ] `appId` in `capacitor.config.ts` matches the store bundle id exactly
- [ ] `NSMotionUsageDescription` present (iOS) and motion permission handled
- [ ] `server.url` **not** set in production config (no live-reload leak)
- [ ] Static export is current (`out/` regenerated) before `cap sync`
- [ ] Icons + splash updated to store specs
- [ ] Privacy policy URL (even though no data leaves the device)
- [ ] `npm run qa` and `npm run test:e2e` green
- [ ] `versionCode` / build number bumped

## 3. Versioning

- Web app version = package.json `version`.
- Each platform has its own build counter (iOS build number, Android `versionCode`) that must
  increase per submission.

## 4. CI (future)

A GitHub Actions workflow could automate: `npm ci` → `npm run qa` → `npm run mobile` →
build unsigned AAB/IPA → upload to TestFlight / Play internal testing. Tracked as a GitHub issue.
