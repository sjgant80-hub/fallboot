// FallBoot service worker · portable estate offline layer
// v1 · MIT · AI-Native Solutions

const CACHE = 'fallboot-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest'
];

// Estate URLs baked in as a fallback so the SW knows what to route
// even before the client hands it the FallHarbor manifest.
const ESTATE_ORIGINS = [
  'https://sjgant80-hub.github.io/'
];

const ESTATE_TOOLS = [
  'https://sjgant80-hub.github.io/fallmirror/',
  'https://sjgant80-hub.github.io/mesh-89-tracker/',
  'https://sjgant80-hub.github.io/fallsignature/',
  'https://sjgant80-hub.github.io/hello-device/',
  'https://sjgant80-hub.github.io/quine-cube-runner/',
  'https://sjgant80-hub.github.io/fallshell/',
  'https://sjgant80-hub.github.io/fallharbor/',
  'https://sjgant80-hub.github.io/foldkit-extension/',
  'https://sjgant80-hub.github.io/foldkit/',
  'https://sjgant80-hub.github.io/fallpx/',
  'https://sjgant80-hub.github.io/9-axis-human-sonar/',
  'https://sjgant80-hub.github.io/bloom-profile-builder/',
  'https://sjgant80-hub.github.io/bloom-weighted-sididy/',
  'https://sjgant80-hub.github.io/kappa-eeg-checker/',
  'https://sjgant80-hub.github.io/init-book/',
  'https://sjgant80-hub.github.io/fallbrief/'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Cache the shell first (must-succeed).
    await cache.addAll(SHELL);
    // Best-effort pre-warm of estate tools. Opaque responses are fine.
    await Promise.allSettled(ESTATE_TOOLS.map(async (url) => {
      try {
        const req = new Request(url, { mode: 'no-cors' });
        const res = await fetch(req);
        await cache.put(req, res);
      } catch (e) { /* offline install · client can re-bundle later */ }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

const isEstate = (url) => ESTATE_ORIGINS.some(o => url.startsWith(o));
const isShell = (url) => {
  const u = new URL(url);
  return u.origin === self.location.origin;
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;

  // Shell · cache-first, then network, then cached fallback
  if (isShell(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone()).catch(()=>{});
        return res;
      } catch {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
        return new Response('offline', { status: 503, statusText: 'offline' });
      }
    })());
    return;
  }

  // Estate tools · cache-first · opaque acceptable · network on miss
  if (isEstate(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const noCors = new Request(req.url, { mode: 'no-cors' });
        const res = await fetch(noCors);
        cache.put(noCors, res.clone()).catch(()=>{});
        return res;
      } catch {
        // Deep offline · nothing to return
        return new Response('tool unavailable offline · run Bundle while online', {
          status: 503, statusText: 'offline'
        });
      }
    })());
    return;
  }

  // Everything else · pass through, opportunistic cache
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.ok && req.url.startsWith('http')) {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone()).catch(()=>{});
      }
      return res;
    } catch {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      return hit || new Response('offline', { status: 503 });
    }
  })());
});

// Message channel · client can ask SW to warm additional URLs after
// FallHarbor manifest fetch resolves.
self.addEventListener('message', async (event) => {
  const msg = event.data || {};
  if (msg.type === 'WARM' && Array.isArray(msg.urls)) {
    const cache = await caches.open(CACHE);
    const results = await Promise.allSettled(msg.urls.map(async (u) => {
      const req = new Request(u, { mode: 'no-cors' });
      const res = await fetch(req);
      await cache.put(req, res);
      return u;
    }));
    event.source && event.source.postMessage({
      type: 'WARM_DONE',
      ok: results.filter(r => r.status === 'fulfilled').length,
      fail: results.filter(r => r.status === 'rejected').length
    });
  }
});
