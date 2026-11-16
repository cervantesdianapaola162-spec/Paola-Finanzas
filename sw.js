/* Service worker mínimo de "Vida adulta :c".
   Guarda la app (no tus datos) para que abra rápido y sin internet.
   Si cambias index.html, sube el número de VERSION para que se actualice. */
const VERSION = 'va-v2';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Nunca guardar las respuestas de Google Apps Script (tus datos van siempre frescos)
  if (url.hostname.endsWith('script.google.com') || url.hostname.endsWith('googleusercontent.com')) return;
  // La página: primero internet, si no hay, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  // Íconos, fuentes y Chart.js: la copia guardada y se actualiza en segundo plano
  e.respondWith(caches.match(req).then(guardada => {
    const red = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); } return r; }).catch(() => guardada);
    return guardada || red;
  }));
});
