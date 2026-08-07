# Deployment

The app is a Next.js **static export** (`out/`) that can be hosted on any **root-served** static
host, installed as a PWA, or wrapped with **Capacitor 8** and shipped to the App Store and Google
Play.

## 1. Web (root-served static host)

```bash
npm run build    # writes out/ to a root-served static host
```

The service worker (`public/sw.js`, copied verbatim into `out/`) is a committed runtime-caching SW —
no build step. On install it precaches the four static routes (`/`, `/saved`, `/settings`, `/diet`);
navigations are network-first with cache fallback and `/_next/static` + other same-origin assets are
cache-first. Bump the `VERSION` constant in `public/sw.js` when you change caching logic; old
`slowcarb-randomizer-*` caches are purged on activation. Full offline works after the app is
installed and used once online (chunks and RSC payloads fill the cache as they load).

The PWA must be served from a **domain root**. The service worker and every precache URL use
root-absolute paths (`register("/sw.js")`, `/...`), so sub-path hosting — e.g. a GitHub Pages
*project* page at `user.github.io/repo/` — makes `/sw.js` 404 and silently breaks offline caching;
the app still serves but is not an offline PWA. Host `out/` on a root path instead: Vercel, Netlify,
Cloudflare Pages, user-site GitHub Pages (`user.github.io`), S3 + CloudFront, etc. The result
is a fully offline-capable PWA (manifest + icons are in `public/`). On the live site
(https://slowcarbrandomizer.vercel.app) the service worker only registers in production builds, so
`next dev` and e2e runs are unaffected.

### Offline verification (manual)

1. `npm run build`, then serve the export: `npx serve out -l 4000`.
2. Open http://localhost:4000 in DevTools ▸ Application:
   - **Service Workers** shows an active `sw.js`.
   - **Cache Storage** shows the `slowcarb-randomizer-<version>` cache(s).
3. Go to Network ▸ **Offline**, then reload `/` and tap-navigate and hard-reload through
   `/saved`, `/settings` and `/diet`. All pages render from cache.
4. Rebuild after a source change and reload: the new cache appears and the old one is purged.

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

Service worker registration is skipped inside Capacitor WebViews
(`Capacitor.isNativePlatform()`), so the native bundles never install the web PWA's service worker.

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
