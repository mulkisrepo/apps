
 
// Version 0.54

const version = 40
const cacheName = version + ''

const urlsToCacheKeys = new Set([
  '/offline.html',
  'http://statics.suitsupply.com/images/products/Jackets/large/Jackets_Green_Plain_Havana_C993_Suitsupply_Online_Store_1.jpg'
].map(u => new URL(u, self.location).href))

self.addEventListener('install', e => {
  console.log('% install')
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(Array.from(urlsToCacheKeys))
      .then(() => self.skipWaiting());
    })
  )
});

self.addEventListener('activate', event => {
  console.log('% activate')
  // event.waitUntil(self.clients.claim());

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if ([cacheName].indexOf(key) === -1) {
          console.log('# deleting', key)
          return caches.delete(key);
        }
      }));
    })
  );
});

const cacheAResponse = (event, cache, response, log) => {
  if(urlsToCacheKeys.has(event.request.url)) { // remove the condition to cache everything!
    console.log(log, event.request.url);
    cache.put(event.request, response.clone());
  }
  return response;
}

const cacheARequest = event => event.respondWith(
  caches.open(cacheName).then(cache =>
    fetch(event.request.clone()).then(response => 
      cacheAResponse(event, cache, response, '* cached ')
    )
  )
);

const tryServingFromCache = event => event.respondWith(
  caches.open(cacheName).then(cache =>
    cache.match(event.request).then(resp => {
      if(!!resp) {
        console.log('> from cache', event.request.url)
      }
      return resp || fetch(event.request).then(response => 
        cacheAResponse(event, cache, response, '$ cached ')
      )
    })
  )
);


self.addEventListener('fetch', event => {
  if(navigator.onLine) {
    cacheARequest(event)
  } else {
    tryServingFromCache(event)
  }
});