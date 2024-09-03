'use strict';

const version = '20210519';
const staticCacheName = version + 'static';
const pagesCacheName = 'pages';
const imagesCacheName = 'images';
const maxPages = 50; // Maximum number of pages to cache
const maxImages = 100; // Maximum number of images to cache
const timeout = 5000; // Number of milliseconds before timing out

const cacheList = [
    staticCacheName,
    pagesCacheName,
    imagesCacheName
];

function updateStaticCache() {
    return caches.open(staticCacheName)
    .then( staticCache => {
        return staticCache.addAll([
            '/blocks/sidebar.html',
            '/offline',
            '/css/style.css',
            '/css/open-iconic-bootstrap.min.css',
            '/css/font-awesome.min.css',
            '/css/bootstrap.min.css',

        ]);
    });
}

// Cache the page(s) that initiate the service worker
function cacheClients() {

}

// Remove caches whose name is no longer valid
function clearOldCaches() {
    return caches.keys()
    .then( keys => {
        return Promise.all(keys
            .filter(key => !cacheList.includes(key))
            .map(key => caches.delete(key))
        );
    });
}

function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
    .then( cache => {
        cache.keys()
        .then(keys => {
            if (keys.length > maxItems) {
                cache.delete(keys[0])
                .then( () => {
                    trimCache(cacheName, maxItems)
                });
            }
        });
    });
}

addEventListener('install', event => {
    event.waitUntil(
        updateStaticCache()
        .then( () => {
            cacheClients();
        })
        .then( () => {
          return skipWaiting();
        })
    );
});



if (registration.navigationPreload) {
    addEventListener('activate', event => {
        event.waitUntil(
            registration.navigationPreload.enable()
            //clients.claim()
        );
    });
}

self.addEventListener('message', event => {
   
    if (event.origin !== "https://openyellow.org") // Compliant
    return;
  
    if (event.data.command == 'trimCaches') {
        trimCache(pagesCacheName, maxPages);
        trimCache(imagesCacheName, maxImages);
    }
});


addEventListener('fetch', event => {
  CheckData(event);

});


function CheckData(event){
     const request = event.request;
    // Ignore non-GET requests
    if (request && request.method !== 'GET') {
        return;
    }

    const retrieveFromCache = false;

    // For HTML requests, try the network first, fall back to the cache, finally the offline page
    if (request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            new Promise( resolveWithResponse => {
                Promise.resolve(event.preloadResponse)
                .then( responseFromPreloadOrFetch => {
                    resolveWithResponse(responseFromPreloadOrFetch);
                })
                .catch(responseFromCache => {
                        resolveWithResponse(
                           caches.match('/offline')
                        );
                    });
               

            })
        )
        return;
    } 
}