# Ver.0.8.68 banner repair

The 0.8.63 WebP already contains corrupted pixels when decoded outside a browser. The JPEG and four tiles were derived from that file. Re-encoding, CSS changes and cache invalidation could not recover the missing artwork. Historical Base64 chunks reconstruct the same WebP byte for byte.

The replacement `assets/gacha/hoshi-no-yakusoku-banner-v0868.jpg` comes exclusively from the user's supplied intact JPEG (1536 × 864). Source SHA-256: `3c369fade309b35656360234afdad2acaf3430d7f799e77ec48afde6b5be7c04`. It is encoded as baseline RGB JPEG, quality 94, without crop, resize, generation or character edits. All characters and the central title remain intact. Do not rebuild this asset from the obsolete WebP/JPEG/tiles.

The banner is now one normal-flow div/img with intrinsic width/height attributes and CSS width:100%, height:auto, display:block. Legacy hero selectors and tile markup were removed. Landscape width is capped to leave room for the existing cards and buttons; lobby overflow remains accessible on smaller viewports. The image node is retained across lobby/home/result transitions. No clipping, transform, mask, filter, image grid, animation or forced GPU promotion is added to the banner.

Changed script/style query strings and the new image pathname avoid old resource cache entries. The active manifest's start URL is updated. No Service Worker, cache deletion or save-data changes were introduced. `version.json` is updated last in a separate release commit.

## Validation

- Chromium and Playwright WebKit on Windows: image decode 1536 × 864; displayed 16:9 ratio; transform/filter/mask/clip-path none; 844×390, 667×375, 932×430 and 390×844 touch viewports.
- Both engines: one/ten normal pulls, forced UR animation, UR ownership persistence, return to lobby/home, reopen with the same image node. Test-only UR rates were overridden in isolated browser contexts, not production code.
- No HTTP errors. Chromium had no JS errors. Windows WebKit reports an unavailable AudioContext on interaction; the same error reproduces against the unchanged 0.8.67 source.
- Chromium: actual looping Web Audio source starts on gacha entry and stops on return home.
- BGM/audio implementation and pull/reveal/unlock/entry functions are unchanged. Live, pointer events, tap sounds, smooth clock and charts have no changes.
- Changed JS passes node --check; git diff --check passes.

These are desktop browser tests, not an iPhone PWA test. Hardware mute-switch behavior, iPhone GPU compositing and actual live audio still require device confirmation. The existing ambient audio-session implementation is preserved exactly.
