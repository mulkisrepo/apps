self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open('offline-cache').then(function(cache) {
      return cache.addAll([
	  'index.html',
	  'Calsci.js',
	  'complete.ly.1.0.1.min.js',
	  'style.css'
	  ]);
    })
  );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request)
    })
  );
});
