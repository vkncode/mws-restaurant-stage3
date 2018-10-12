const staticCacheName = 'restaurant-review-v1';
const urlsToCache = [
  'index.html',
  'restaurant.html',
  '/destimg',
  '/img',
  '/data',
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
  //adding code in satge 3 to ignore PUT/POST requests
  //if the request method is not get you return
  let request = event.request;
  if(request.method !== "GET"){
      return;
  }
  event.respondWith(
    caches.open(staticCacheName).then(function(cache){
      return cache.match(event.request).then(function(response){
          return response || fetch(event.request).then(function(response){
              cache.put(event.request,response.clone());
              return response;
           });
       });
    }).catch(function(error){
        console.log("cannot cache this :",error);
    })
   ); 
});