const CACHE_NAME = "stockwise-shell-v15";
const OFFLINE_PATH = "/offline";
const OFFLINE_ACCESS_KEY = "/__stockwise_offline_access__";

function isNetworkOnlyPage(pathname) {
    return pathname === "/" ||
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname.startsWith("/invitations/");
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        warmPage(
            new URL(OFFLINE_PATH, self.location.origin).href,
        ).then(async () => {
            await self.skipWaiting();
        }),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys
            .filter((key) =>
                key.startsWith("stockwise-shell-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)));
        await self.clients.claim();
    })());
});

function isHtml(response) {
    return response.ok && !response.redirected &&
        response.headers.get("content-type")?.includes("text/html");
}

async function save(cache, request, response) {
    // Storage failure must not turn a successful request into an error.
    try {
        await cache.put(request, response.clone());
    } catch (error) {
        console.warn("[SW] Unable to save offline resource", error);
    }
}

async function hasOfflineAccess(cache) {
    return Boolean(await cache.match(OFFLINE_ACCESS_KEY));
}

async function clearProtectedPages(cache) {
    const requests = await cache.keys();
    await Promise.all(requests.map(async (request) => {
        const pathname = new URL(request.url).pathname;
        if (
            pathname === OFFLINE_PATH ||
            pathname === OFFLINE_ACCESS_KEY ||
            pathname.startsWith("/_next/static/")
        ) {
            return;
        }
        const response = await cache.match(request);
        if (response && isHtml(response)) {
            await cache.delete(request);
        }
    }));
}

async function setOfflineAccess(enabled) {
    const cache = await caches.open(CACHE_NAME);
    if (enabled) {
        await cache.put(
            OFFLINE_ACCESS_KEY,
            new Response("enabled", {
                headers: { "Content-Type": "text/plain" },
            }),
        );
        return;
    }
    await cache.delete(OFFLINE_ACCESS_KEY);
    await clearProtectedPages(cache);
}

async function cacheAsset(url) {
    const cache = await caches.open(CACHE_NAME);
    if (await cache.match(url)) return;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Asset unavailable");
    await cache.put(url, response);
}

async function warmPage(url, assets = []) {
    const pathname = new URL(url).pathname;
    if (isNetworkOnlyPage(pathname)) return;
    const cache = await caches.open(CACHE_NAME);
    if (
        pathname !== OFFLINE_PATH &&
        !(await hasOfflineAccess(cache))
    ) {
        return;
    }

    const response = await fetch(url, {
        headers: { Accept: "text/html" },
        cache: "no-cache",
    });
    if (!isHtml(response)) return;
    const html = await response.clone().text();
    const dependencies = new Set(assets);
    for (const match of html.matchAll(
        /(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/g,
    )) {
        dependencies.add(new URL(match[1].replaceAll("&amp;", "&"), url).href);
    }
    // Publish the document only after its initial JS and CSS are available.
    await Promise.all([...dependencies].map(async (asset) => {
        const parsed = new URL(asset, self.location.origin);
        if (parsed.origin === self.location.origin &&
            parsed.pathname.startsWith("/_next/static/")) {
            await cacheAsset(parsed.href);
        }
    }));
    await cache.put(url, response);
}

self.addEventListener("message", (event) => {
    if (event.data?.type === "SET_OFFLINE_ACCESS") {
        event.waitUntil(setOfflineAccess(Boolean(event.data.enabled)));
        return;
    }
    if (event.data?.type !== "CACHE_PAGE") return;
    const url = new URL(event.data.url, self.location.origin);
    if (url.origin !== self.location.origin) return;
    event.waitUntil(Promise.allSettled([
        warmPage(url.href, event.data.assets ?? []),
        warmPage(new URL(OFFLINE_PATH, self.location.origin).href),
    ]));
});

async function navigation(request) {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(request.url);

    if (isNetworkOnlyPage(url.pathname)) {
        try {
            return await fetch(request, { cache: "no-store" });
        } catch {
            return await offlineFallback(request, cache);
        }
    }

    try {
        const response = await fetch(request);
        if (
            isHtml(response) &&
            await hasOfflineAccess(cache)
        ) {
            await save(cache, request, response);
        }
        return response;
    } catch {
        return await offlineFallback(
            request,
            cache,
            await hasOfflineAccess(cache),
        );
    }
}

async function offlineFallback(request, cache, allowCachedPage = false) {
    // HTML and RSC responses have different Vary headers. Only use HTML.
    if (allowCachedPage) {
        const cached = await cache.match(request, { ignoreVary: true });
        if (cached && isHtml(cached)) return cached;
    }
    const offlinePage = await cache.match(
        OFFLINE_PATH,
        { ignoreVary: true },
    );
    if (offlinePage && isHtml(offlinePage)) {
        // Load at its real URL so Next hydrates the correct route.
        if (new URL(request.url).pathname !== OFFLINE_PATH) {
            return Response.redirect(
                new URL(OFFLINE_PATH, self.location.origin).href, 302,
            );
        }
        return offlinePage;
    }
    return new Response(
        "<h1>You are offline</h1><p>Reconnect and reload this page.</p>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
}

async function asset(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await save(cache, request, response);
    return response;
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== "GET" ||
        url.origin !== self.location.origin ||
        url.pathname.startsWith("/api/")) return;
    if (request.mode === "navigate") {
        event.respondWith(navigation(request));
    } else if (url.pathname.startsWith("/_next/static/")) {
        event.respondWith(asset(request));
    }
    // Never mix Next.js RSC/prefetch payloads with cached HTML documents.
});
