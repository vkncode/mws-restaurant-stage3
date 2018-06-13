const staticCacheName = 'restaurant-review-v1';
const urlsToCache = [
  'index.html',
  '/destimg',
  '/img'
];

//adding cache
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName)
        .then(function(cache){
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate',function(event){
  console.log('active to start');
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(staticCacheName).then(function(cache){
      return cache.match(event.request).then(function(response){
          return response || fetch(event.request).then(function(response){
              cache.put(event.request,response.clone());
          });
      });
  })
); 
});