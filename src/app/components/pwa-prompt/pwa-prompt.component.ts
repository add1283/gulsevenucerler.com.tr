import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-pwa-prompt',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pwa-prompt.component.html',
    styleUrls: ['./pwa-prompt.component.scss']
})
export class PwaPromptComponent implements OnInit, OnDestroy {

    showInstallPrompt = false;
    private deferredPrompt: any;
    private promptShownKey = 'pwa-prompt-shown';
    private promptDismissedKey = 'pwa-prompt-dismissed';

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.setupPWAPrompt();
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
        }
    }

    private setupPWAPrompt() {
        // Check if user has already dismissed the prompt recently
        const promptDismissed = localStorage.getItem(this.promptDismissedKey);
        const dismissedTime = promptDismissed ? new Date(promptDismissed).getTime() : 0;
        const now = new Date().getTime();
        const dayInMs = 24 * 60 * 60 * 1000;

        // Don't show if dismissed in last 7 days
        if (now - dismissedTime < dayInMs * 7) {
            return;
        }

        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return; // Already installed
        }

        // Check if iOS Safari
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

        if (isIos && isSafari) {
            // Show iOS Safari specific prompt after a delay
            setTimeout(() => {
                this.showInstallPrompt = true;
            }, 3000);
        }
    }

    private handleBeforeInstallPrompt(e: Event) {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();

        // Stash the event so it can be triggered later
        this.deferredPrompt = e;

        // Show the install prompt after a short delay
        setTimeout(() => {
            this.showInstallPrompt = true;
        }, 2000);
    }

    async installApp() {
        if (!this.deferredPrompt) {
            // For iOS Safari, show instructions
            this.showIOSInstructions();
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA kurulumu kabul edildi');
                localStorage.setItem(this.promptShownKey, new Date().toISOString());
            } else {
                console.log('PWA kurulumu reddedildi');
                this.dismissPrompt();
            }

            // Clear the deferredPrompt
            this.deferredPrompt = null;
            this.showInstallPrompt = false;

        } catch (error) {
            console.log('PWA kurulum hatası:', error);
            this.dismissPrompt();
        }
    }

    dismissPrompt() {
        this.showInstallPrompt = false;
        localStorage.setItem(this.promptDismissedKey, new Date().toISOString());
    }

    private showIOSInstructions() {
        const message = `
Bu uygulamayı ana ekranınıza eklemek için:

1. Safari'nin altındaki Paylaş butonuna (⬆️) dokunun
2. "Ana Ekrana Ekle" seçeneğini bulup dokunun
3. "Ekle" butonuna dokunun

Bu sayede uygulamaya kolayca erişebilirsiniz!
    `;

        alert(message);
        this.dismissPrompt();
    }

    // Service Worker registration
    registerServiceWorker() {
        if (isPlatformBrowser(this.platformId) && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker kayıt başarılı:', registration);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, refresh the page
                                    if (confirm('Yeni bir güncelleme mevcut. Sayfayı yeniden yüklemek ister misiniz?')) {
                                        window.location.reload();
                                    }
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.log('Service Worker kayıt hatası:', error);
                });
        }
    }
}
