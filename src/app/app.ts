import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ServicesComponent } from './components/services/services.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { FaqComponent } from './components/faq/faq.component';
import { HealingProcessComponent } from './components/healing-process/healing-process.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { PwaPromptComponent } from './components/pwa-prompt/pwa-prompt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, HomeComponent, AboutComponent, ServicesComponent, CertificatesComponent, FaqComponent, HealingProcessComponent, ContactComponent, FooterComponent, PwaPromptComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'gulsevenucerler.com.tr';
  private isBrowser: boolean;
  showMainContent = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Hızlı başlatma - loading yok
    if (this.isBrowser) {
      this.registerServiceWorker();

      // Router navigation'ı dinle
      this.router.events.subscribe(() => {
        this.showMainContent = this.router.url === '' || this.router.url === '/';
        this.cdr.markForCheck();
      });

      this.cdr.markForCheck();
    }
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker kayıt başarılı:', registration);
        })
        .catch((error) => {
          console.log('Service Worker kayıt hatası:', error);
        });
    }
  }
}
