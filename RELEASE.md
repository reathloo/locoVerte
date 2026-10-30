# locoVerte: Release checklist

The source stays offline-first. A Git push, an unsigned ZIP, a signed Firefox XPI, and a browser-store publication are different states. Do not describe one as another.

## Package and checks

1. Increase `manifest.json` version for each submitted update. The current release is **0.2.8**.
2. Run `pnpm install --frozen-lockfile`, `pnpm run build:vendor`, `python3 -m unittest discover -s tests -p 'test_*.py'`, `pnpm run test:local`, `pnpm run package:extension`, and `pnpm run package:source`.
3. Unpack `dist/locoverte-0.2.8.zip` into a temporary directory and run `pnpm exec web-ext lint --source-dir <directory>`. Lint the package, not the repository, so development scripts are excluded.
4. Run the browser regression page with fresh local fixtures; test an installed extension in each target browser. Check a disconnected/offline run, downloads, the optional upload-field action, clipboard paste, PDF page tools, dark/light mode, and large/corrupt inputs. Record browser versions and pass/fail results before submission.
5. Review `AMO_REVIEW.md`, `PRIVACY.md`, permissions, `LICENSE`, `THIRD_PARTY_NOTICES.md`, bundled library licenses, store screenshots, and the public privacy-policy URL. The public GitHub copy of `PRIVACY.md` can be linked, but store-specific requirements still need review.

## Browser packages

| Browser | Artifact and submission | Remaining gate |
| --- | --- | --- |
| Chrome | `dist/locoverte-0.2.8.zip` to Chrome Web Store | Installed-extension smoke test, store account, listing, privacy disclosures, review |
| Edge | Same ZIP to Microsoft Edge Add-ons | Installed-extension smoke test, Partner Center, listing, review |
| Firefox Desktop | Extension ZIP and matching source ZIP to addons.mozilla.org; AMO signs the extension | Installed-extension smoke test, AMO account, listing assets, signing/review. The stable Gecko ID and `none` data-collection declaration are in the manifest. |
| Safari macOS | Use the ZIP with Apple’s Safari Web Extension Packager, then build the containing macOS app | Full Xcode or App Store Connect packager, Apple developer identity, app icon/signing, Safari smoke test, review |

The packaged Firefox lint currently reports zero errors and five warnings originating in bundled PDF.js code (`Function` constructor and dynamic imports). Before submitting, review these warnings against the exact bundled PDF.js version and be ready to explain them to AMO. Do not silently suppress them.

`dist/locoverte-0.2.8-source.zip` contains the human-readable project source, tests, locked dependencies, build scripts, and `AMO_REVIEW.md`. Built vendor files are deliberately excluded and reproduced from the locked official npm packages during the documented build.

Safari is **not** a ZIP-only install. With full Xcode on macOS, Apple documents `xcrun safari-web-extension-packager /path/to/unpacked-extension --macos-only --swift --copy-resources --no-open` as the packaging route. Choose the final app name and bundle identifier in the packager and inspect its warnings. On this development host, only Apple Command Line Tools are active; the Safari packager and `xcodebuild` are unavailable. App Store Connect’s web packager is another route if the developer account supports it. Neither route has been validated here.

## Updates

For a new version, update the manifest version, rebuild and retest the ZIP, then upload the new package to each browser store separately. Browser-store updates reach users through that store after its review; pushing Git alone does not update installed extensions. Safari updates also require rebuilding and distributing the containing app.

Useful official references: [Chrome Web Store preparation](https://developer.chrome.com/docs/webstore/prepare), [Microsoft Edge hosting](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/hosting-and-updating), [Firefox manifest settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings), [Safari packaging](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari).
