# FallBoot

Portable estate bundle. Every AI-Native Solutions tool cached offline in one page. Runs from USB stick, microSD, or a plain folder on any machine — no internet after packaging.

## What it does

- Reads the [FallHarbor manifest](https://sjgant80-hub.github.io/fallharbor/manifest.json) and shows every estate tool with its cache status.
- **Bundle** — pins every tool into the browser's Cache Storage in one click. Green dot next to each tool means it's ready to launch offline.
- **Verify integrity** — SHA-256 hashes every cached same-origin response, flags any that changed since the last verify pass. Cross-origin GitHub Pages responses come back opaque; those get a pass rather than a hash.
- **Export bundle (.zip)** — downloads a zip containing this page, the service worker, the PWA manifest, and every cached estate entry point. Drop that zip onto a USB stick and you carry the estate with you.
- **Purge cache** — clears everything for a fresh start.

## Use cases

- **Border crossings** — the USB stick shows as a plain storage device. No active network stack, no signed-in accounts, no leaked identifiers. Every estate tool is local-first (WebLLM, IndexedDB, WebRTC) so no traffic leaves the machine.
- **Offline-first field work** — pack once, use anywhere.
- **Rapid deployment** — provisioning a fresh laptop takes as long as unzipping the bundle.
- **Compromised phone recovery** — boot from USB, run the estate from cache without touching the compromised device.

## Boot from USB

The "Boot from USB" tab inside FallBoot has full walkthrough:

1. Grab the GrapheneOS installer ISO.
2. Install Ventoy on a 32 GB+ USB stick.
3. Drop the ISO on the Ventoy partition.
4. Export the FallBoot bundle, unzip it into a `fallboot/` folder on the same partition.
5. Copy a portable Chromium build alongside it.
6. Verify the cache on the machine you'll leave behind; carry the hash printout as tamper evidence.

## Live

**https://sjgant80-hub.github.io/fallboot/**

## Cross-origin cache notes

GitHub Pages doesn't set `Access-Control-Allow-Origin: *` on the estate origins, so fetches from FallBoot go out with `mode: 'no-cors'` and come back opaque. The Cache Storage API stores opaque responses just fine — the browser serves them transparently on navigation. What we lose is the ability to inspect the body from JS, which means:

- Byte counts for opaque entries are estimated (Cache Storage doesn't expose per-entry size).
- Hash verification only runs against same-origin (shell) responses. Opaque estate entries are marked "opaque" rather than hashed — this is a real limitation, not a bug.

For strong end-to-end integrity across origins, ship the estate through a same-origin proxy or convince each estate origin to serve CORS-permissive headers.

## License

MIT · AI-Native Solutions · 2026
