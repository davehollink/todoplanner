// FocusPlanner Service Worker voor native iPhone (iOS PWA) & Desktop Systeemmeldingen
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Ontvang berichten vanuit de app om een native iOS / Desktop systeemmelding te tonen
self.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'SHOW_NATIVE_NOTIFICATION') {
        const title = data.title || 'FocusPlanner';
        const options = {
            body: data.body || 'Activiteit staat nu op je planning.',
            icon: '/focusplanner-icon.png',
            badge: '/focusplanner-icon.png',
            tag: data.tag || ('fp-notif-' + Date.now()),
            renotify: true,
            requireInteraction: false,
            vibrate: [180, 80, 180],
            data: {
                taskId: data.taskId || null,
                url: '/'
            }
        };
        event.waitUntil(self.registration.showNotification(title, options));
    }
});

// Ondersteuning voor Web Push events
self.addEventListener('push', (event) => {
    let payload = { title: 'FocusPlanner', body: 'Je hebt een geplande activiteit!' };
    try {
        if (event.data) payload = event.data.json();
    } catch (e) {
        if (event.data) payload.body = event.data.text();
    }
    event.waitUntil(
        self.registration.showNotification(payload.title || 'FocusPlanner', {
            body: payload.body,
            icon: '/focusplanner-icon.png',
            badge: '/focusplanner-icon.png',
            vibrate: [180, 80, 180]
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (self.clients.openWindow) return self.clients.openWindow('/');
        })
    );
});
