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
            // Add small delay to ensure page is fully loaded
            setTimeout(() => {
                this.setupPWAPrompt();
            }, 1000);
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
        }
    }

    private setupPWAPrompt() {
        // Comprehensive PWA installation check
        if (this.isPWAInstalled()) {
            console.log('[PWA] App already installed, skipping prompt');
            return;
        }

        // Check if user has dismissed recently
        if (this.isRecentlyDismissed()) {
            console.log('[PWA] Recently dismissed, skipping prompt');
            return;
        }

        // Check if prompt was already shown in this session
        if (sessionStorage.getItem('pwa-prompt-shown-session')) {
            console.log('[PWA] Already shown in this session, skipping');
            return;
        }

        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));

        // Set up delayed check for browsers that support PWA but don't fire the event immediately
        this.setupDelayedPrompt();
    }

    private isPWAInstalled(): boolean {
        // Method 1: Check if running in standalone mode (PWA installed)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] Detected standalone mode');
            return true;
        }

        // Method 2: iOS Safari standalone check
        if ((window.navigator as any).standalone === true) {
            console.log('[PWA] Detected iOS Safari standalone');
            return true;
        }

        // Method 3: Check if launched from installed PWA (Chrome/Edge)
        if (window.location.search.includes('utm_source=pwa')) {
            console.log('[PWA] Detected PWA launch parameter');
            return true;
        }

        // Method 4: Check localStorage flag (set when PWA is installed)
        if (localStorage.getItem('pwa-installed') === 'true') {
            console.log('[PWA] Found installation flag in localStorage');
            return true;
        }

        // Method 5: Check if beforeinstallprompt was already used
        if (localStorage.getItem('pwa-install-attempted') === 'true') {
            // Reset after 30 days in case user uninstalled
            const attemptTime = localStorage.getItem('pwa-install-attempt-time');
            if (attemptTime) {
                const daysPassed = (Date.now() - parseInt(attemptTime)) / (1000 * 60 * 60 * 24);
                if (daysPassed < 30) {
                    console.log('[PWA] Install was attempted recently');
                    return true;
                } else {
                    // Clear old flags
                    localStorage.removeItem('pwa-install-attempted');
                    localStorage.removeItem('pwa-install-attempt-time');
                }
            }
        }

        console.log('[PWA] App not detected as installed');
        return false;
    }

    private isRecentlyDismissed(): boolean {
        const promptDismissed = localStorage.getItem(this.promptDismissedKey);
        if (!promptDismissed) return false;

        const dismissedTime = new Date(promptDismissed).getTime();
        const now = new Date().getTime();
        const dayInMs = 24 * 60 * 60 * 1000;

        // Don't show if dismissed in last 7 days
        return (now - dismissedTime) < (dayInMs * 7);
    }

    private setupDelayedPrompt() {
        // Wait for page to load completely and check conditions
        setTimeout(() => {
            if (this.isPWAInstalled() || this.deferredPrompt) {
                return; // Skip if already installed or event fired
            }

            // Check if this is a supported browser for PWA
            if (this.isSupportedBrowser()) {
                console.log('[PWA] Showing delayed prompt for supported browser');
                this.showDelayedPrompt();
            }
        }, 5000); // 5 second delay for better UX
    }

    private isSupportedBrowser(): boolean {
        // iOS Safari check
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

        if (isIos && isSafari) {
            return true;
        }

        // Chrome/Edge/Opera check
        const isChrome = /Chrome/.test(navigator.userAgent);
        const isEdge = /Edge/.test(navigator.userAgent);
        const isOpera = /Opera/.test(navigator.userAgent);

        return isChrome || isEdge || isOpera;
    }

    private showDelayedPrompt() {
        // Extra check before showing
        if (this.isPWAInstalled() || this.showInstallPrompt) {
            return;
        }

        console.log('[PWA] Showing install prompt');
        this.showInstallPrompt = true;
        sessionStorage.setItem('pwa-prompt-shown-session', 'true');
    }

    private handleBeforeInstallPrompt(e: Event) {
        console.log('[PWA] beforeinstallprompt event fired');

        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();

        // Stash the event so it can be triggered later
        this.deferredPrompt = e;

        // Double check if PWA is already installed
        if (this.isPWAInstalled()) {
            console.log('[PWA] App already installed, ignoring beforeinstallprompt');
            return;
        }

        // Check session storage to avoid showing multiple times
        if (sessionStorage.getItem('pwa-prompt-shown-session')) {
            console.log('[PWA] Already shown in this session via beforeinstallprompt');
            return;
        }

        // Show the install prompt after a short delay
        setTimeout(() => {
            if (!this.isPWAInstalled() && !this.showInstallPrompt) {
                console.log('[PWA] Showing prompt from beforeinstallprompt event');
                this.showInstallPrompt = true;
                sessionStorage.setItem('pwa-prompt-shown-session', 'true');
            }
        }, 2000);
    }

    async installApp() {
        console.log('[PWA] Install button clicked');

        // Set installation attempt flags
        localStorage.setItem('pwa-install-attempted', 'true');
        localStorage.setItem('pwa-install-attempt-time', Date.now().toString());

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
                console.log('[PWA] Installation accepted');
                localStorage.setItem('pwa-installed', 'true');
                localStorage.setItem(this.promptShownKey, new Date().toISOString());

                // Set up listener for successful installation
                this.setupInstallationListener();
            } else {
                console.log('[PWA] Installation declined');
                this.dismissPrompt();
            }

            // Clear the deferredPrompt
            this.deferredPrompt = null;
            this.showInstallPrompt = false;

        } catch (error) {
            console.log('[PWA] Installation error:', error);
            this.dismissPrompt();
        }
    }

    private setupInstallationListener() {
        // Listen for successful PWA installation
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App successfully installed');
            localStorage.setItem('pwa-installed', 'true');
            this.showInstallPrompt = false;
        });
    }

    dismissPrompt() {
        console.log('[PWA] Prompt dismissed by user');
        this.showInstallPrompt = false;
        localStorage.setItem(this.promptDismissedKey, new Date().toISOString());
        sessionStorage.setItem('pwa-prompt-shown-session', 'true');
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
                    console.log('[SW] Service Worker registered successfully:', registration);

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

                    // Set up installation detection
                    this.setupInstallationListener();
                })
                .catch((error) => {
                    console.log('[SW] Service Worker registration failed:', error);
                });
        }
    }
}
