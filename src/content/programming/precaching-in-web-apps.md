---
title: Precaching in Web Apps
type: programming
author: Mint
pubDatetime: 2024-06-12T03:12:00Z
featured: false
draft: false  
tags:
  - Service Worker
  - Precaching
description: "Service Worker & Cache API"
---


## 1. Introduction

### 1.1 What is Precaching?

Precaching is the process of storing essential resources of a web application in advance, allowing the app to load quickly and work reliably—even offline—by serving these resources directly from the cache.

### 1.2 Why is Precaching Important?

- Instant Loading: Ensures critical assets are always available, reducing load times.

- Offline Support: Enables the app to function without a network connection.

- Smooth User Experience: Prevents broken interfaces due to missing resources.


### 1.3 How Does Precaching Work?

Precaching typically leverages a `Service Worker` and the `Cache` API. The Service Worker intercepts network requests and serves cached assets, while the Cache API provides a programmatic way to store and retrieve resources.

- Define which resources are critical for the app’s initial load.

- Use a Service Worker to cache these assets during installation.

- Serve cached assets on subsequent visits or when offline.



## 2. Service Worker

### 2.1 What is a Service Worker?

A Service Worker is a background script that intercepts network requests, manages caching, and enables features like offline support and push notifications.

It is like a programmable proxy running in the browser background. You can think of it as a JavaScript thread that lets your app intercept network requests and fake server responses.


### 2.2 Service Worker Lifecycle

- `Registration`: Main thread registers the Service Worker.

- `Installation`: Service Worker caches specified resources.

- `Activation`: Old caches are cleaned up, and the new Service Worker takes control.

- `Fetch`: Service Worker intercepts network requests and serves cached responses when available.

The intent of the Service Worker lifecycle is to ensure that the Service Worker is always in a valid state and that the cached resources are always up to date.



## 3. Cache API

### 3.1 What Is the Cache API?

The `Cache API` allows Service Workers to store and manage network requests and responses programmatically.


### 3.2 Cache API vs. Browser Cache

|Feature	|Cache API	|Browser Cache	|
|:---:	|:---:	|:---:	|   
|Granular Control	|Yes	|No	|
|Programmatic Access	|Yes (via JavaScript)	|No	|
|Lifespan	|Controlled by developer	|Managed by browser	|
|Use Case	|Offline, custom strategies	|Standard HTTP caching	|


## 4. Implementing Precaching



My web app (divided into different levels) has two arrays of unique CDN URLs:

- `criticalResources`: Resources for the first two levels, required before entering the homepage.

- `deferredResources`: Resources for later levels, needed before entering the third level.

- Goal:

  - Load criticalResources before the homepage, reporting progress to the main thread to show the progress bar.

  - After entering the homepage, load deferredResources in the background. Ensure all deferred resources are loaded before the user enters the third level; otherwise, display a loading screen and loading progress bar.


**CacheServiceWorker.js**
```js
// critical resources and deferred resources
const criticalResources = ["resource1", "resource2", "resource3"];
const deferredResources = ["resource4", "resource5", "resource6"];

const CRITICAL_CACHE = `critical-${CACHE_VERSION}`;
const DEFERRED_CACHE = `deferred-${CACHE_VERSION}`;
const CACHE_TIMEOUT = 30000;

// cache critical resources in install phase
self.addEventListener('install', event => {
  event.waitUntil(
    cacheCriticalResources().finally(() => self.skipWaiting())
    // Activate the new Service Worker
  );
});

// cache deferred resources in activate phase
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      cacheDeferredResources()
    ]).finally(() => self.clients.claim())
    // Take control of the page immediately
  );
});


// fetch event: prioritize cache
self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request).then(res => res || fetch(event.request))
    );
});

// cache critical resources and report progress
async function cacheCriticalResources() {
  const cache = await caches.open(CRITICAL_CACHE);
  let loaded = 0, failed = 0;
  for (let url of criticalResources) {
    try {
      if (await cache.match(url)) {
        loaded++;
        continue;
      }
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        await cache.put(url, res.clone());
        loaded++;
        notifyClients({ type: 'PRECACHE_PROGRESS', loaded, total: criticalResources.length, failed });
      } else {
        failed++;
        notifyClients({ type: 'PRECACHE_ERROR', url, error: `HTTP ${res.status}`, loaded, failed });
      }
    } catch (e) {
      failed++;
      notifyClients({ type: 'PRECACHE_ERROR', url, error: e.name === 'AbortError' ? 'request timeout' : 'network error', loaded, failed });
    }
  }
  notifyClients({ type: 'PRECACHE_CRITICAL_DONE', loaded, failed, total: criticalResources.length });
}

// cache deferred resources
async function cacheDeferredResources() {
  const cache = await caches.open(DEFERRED_CACHE);
  let loaded = 0, failed = 0;
  for (let url of deferredResources) {
    try {
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        await cache.put(url, res.clone());
        loaded++;
      } else {
        failed++;
      }
    } catch (e) {
      failed++;
    }
  }
  notifyClients({ type: 'PRECACHE_DEFERRED_DONE', loaded, failed, total: deferredResources.length });
}

// clean up old caches
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(name => ![CRITICAL_CACHE, DEFERRED_CACHE].includes(name))
      .map(name => caches.delete(name))
  );
}

// fetch with timeout
async function fetchWithTimeout(url, timeout = CACHE_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// notify the main thread
function notifyClients(msg) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage(msg));
  });
}


```

**Main.tsx**
```tsx
import { useState, useEffect } from 'react';

function Main() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ loaded: 0, total: 0, failed: 0, message: '' });
  const [canSkip, setCanSkip] = useState(false);

  const skipCache = () => setLoading(false);

  const retryCache = () => window.location.reload();

   useEffect(() => {
    let timeoutId: number;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/CacheServiceWorker.js').then(reg => {
        console.log('[Main] Service Worker registered');

        // Listen to postMessage regardless of registration state
        navigator.serviceWorker.onmessage = (event) => {
          const { type, loaded, total, failed, url, error } = event.data || {};

          if (type === 'PRECACHE_PROGRESS') {
            setProgress({
              loaded,
              total,
              failed,
              message: `Caching... (${loaded}/${total}${failed ? `, failed: ${failed}` : ''})`
            });
          }

          if (type === 'PRECACHE_ERROR') {
            console.warn(`[Main] Caching error on ${url}: ${error}`);
          }

          if (type === 'PRECACHE_CRITICAL_DONE') {
            console.log('[Main] Critical cache complete');
            setLoading(false);
          }
        };
      });

      // Allow skip if timeout exceeded
      timeoutId = window.setTimeout(() => {
        setCanSkip(true);
        setProgress(progress => ({
          ...progress,
          message: 'Long loading detected. You may skip.'
        }));
      }, 60000);
    } else {
      // fallback: Service Worker not supported
      setLoading(false);
    }

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <div>
        <div>{progress.message || 'Initializing cache...'}</div>
        <button onClick={skipCache} disabled={!canSkip}>Skip</button>
        <button onClick={retryCache}>Retry</button>
      </div>
    );
  }

  return <App />;
}

export default Main;



```

### 4.2 Real-World Example: Step-by-Step Flow

- App Launch:

  - Service Worker installs and caches criticalResources.

  - Progress is reported to the main thread for a skeleton screen.

  - Once all critical resources are cached, the homepage is displayed.

- After Homepage:

  - Service Worker begins caching deferredResources in the background.

- Before Level 3:

  - App checks if all deferred resources are cached.

  - If not, a loading screen is shown until caching is complete.




## 5. Best Practices

- Version your caches to enable smooth updates and avoid stale data.

- Clean up old caches during activation to save storage.

- Gracefully handle fetch failures and provide fallback UI.

- Test offline scenarios regularly to ensure reliability.