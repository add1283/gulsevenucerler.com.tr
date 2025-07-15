import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
    currentYear = new Date().getFullYear();
    showScrollTopButton = false;
    private isBrowser: boolean;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit() {
        if (this.isBrowser) {
            window.addEventListener('scroll', this.onScroll.bind(this));
        }
    }

    ngOnDestroy() {
        if (this.isBrowser) {
            window.removeEventListener('scroll', this.onScroll.bind(this));
        }
    }

    onScroll() {
        if (this.isBrowser) {
            this.showScrollTopButton = window.pageYOffset > 300;
        }
    }

    scrollToTop() {
        if (this.isBrowser) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    scrollToSection(sectionId: string) {
        if (this.isBrowser) {
            // Anasayfada değilse önce anasayfaya git
            if (this.router.url !== '/') {
                this.router.navigate(['/']).then(() => {
                    // Route değişikliğinden sonra kısa bir bekleme
                    setTimeout(() => {
                        this.performScroll(sectionId);
                    }, 100);
                });
            } else {
                this.performScroll(sectionId);
            }
        }
    }

    private performScroll(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
}
