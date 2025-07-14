import { Component, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
    isMenuOpen = false;
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    scrollToSection(sectionId: string) {
        if (this.isBrowser) {
            const element = document.getElementById(sectionId);
            if (element) {
                // Header yüksekliği için offset (100px)
                const headerOffset = 100;
                const elementPosition = element.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                // Smooth scroll with custom duration
                this.smoothScrollTo(offsetPosition, 1200); // 1.2 saniye

                // Mobil menüyü kapat
                if (this.isMenuOpen) {
                    this.isMenuOpen = false;
                }
            }
        }
    }

    private smoothScrollTo(targetPosition: number, duration: number) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime: number | null = null;

        const easeInOutCubic = (t: number): number => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const ease = easeInOutCubic(progress);
            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }
}
