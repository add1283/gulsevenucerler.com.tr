import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Certificate {
  id: number;
  title: string;
  year: string;
  category: 'reiki' | 'accessbars' | 'theta';
  image: string;
  imageUrl?: string; // Gerçek görsel URL'si
  description: string;
  isVisible?: boolean; // Lazy loading için
}

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss'
})
export class CertificatesComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedFilter: string = 'all';
  selectedCertificate: Certificate | null = null;
  isLightboxOpen = false;
  private observer?: IntersectionObserver;
  private animationDelay = 200; // Her kart arasında 200ms gecikme

  certificates: Certificate[] = [
    // Reiki Sertifikaları (3 adet)
    {
      id: 1,
      title: 'Reiki I Sertifikası',
      year: '2019',
      category: 'reiki',
      image: '⚡',
      imageUrl: '/images/certificates/reiki-1.jpg',
      description: 'Temel Reiki teknikleri ve enerji şifacılığına giriş',
      isVisible: false
    },
    {
      id: 2,
      title: 'Reiki II Sertifikası',
      year: '2020',
      category: 'reiki',
      image: '⚡',
      imageUrl: '/images/certificates/reiki-2.jpg',
      description: 'İleri Reiki sembolleri ve uzaktan şifa teknikleri',
      isVisible: false
    },
    {
      id: 3,
      title: 'Reiki Master Sertifikası',
      year: '2021',
      category: 'reiki',
      image: '⚡',
      imageUrl: '/images/certificates/reiki-master.jpg',
      description: 'Reiki Masteri ve öğretmenlik yetkisi',
      isVisible: false
    },

    // AccessBars Sertifikası (1 adet)
    {
      id: 4,
      title: 'AccessBars Sertifikası',
      year: '2020',
      category: 'accessbars',
      image: '🔓',
      imageUrl: '/images/certificates/accessbars.jpg',
      description: 'Kafadaki 32 noktaya dokunarak zihinsel engelleri kaldırma',
      isVisible: false
    },

    // Theta Healing Sertifikaları (diğerleri)
    {
      id: 5,
      title: 'Theta Healing Temel Sertifikası',
      year: '2019',
      category: 'theta',
      image: '🧠',
      imageUrl: '/images/certificates/theta-basic.jpg',
      description: 'Temel Theta Healing teknikleri ve uygulamaları',
      isVisible: false
    },
    {
      id: 6,
      title: 'Theta Healing İleri Sertifikası',
      year: '2020',
      category: 'theta',
      image: '🧠',
      imageUrl: '/images/certificates/theta-advanced.jpg',
      description: 'İleri düzey Theta Healing ve beyin dalgaları',
      isVisible: false
    },
    {
      id: 7,
      title: 'Theta Healing Manifesting Sertifikası',
      year: '2021',
      category: 'theta',
      image: '🧠',
      imageUrl: '/images/certificates/theta-manifesting.jpg',
      description: 'Manifestasyon ve yaratma teknikleri',
      isVisible: false
    },
    {
      id: 8,
      title: 'Theta Healing DNA Sertifikası',
      year: '2022',
      category: 'theta',
      image: '🧠',
      imageUrl: '/images/certificates/theta-dna.jpg',
      description: 'DNA aktivasyonu ve genetik şifacılık',
      isVisible: false
    },
    {
      id: 9,
      title: 'Theta Healing Relationship Sertifikası',
      year: '2021',
      category: 'theta',
      image: '🧠',
      imageUrl: '/images/certificates/theta-relationship.jpg',
      description: 'İlişkiler ve duygusal şifa çalışmaları',
      isVisible: false
    }
  ];

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    // İlk 3 kartı hemen göster
    this.certificates.slice(0, 3).forEach(cert => cert.isVisible = true);
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              const cardElement = entry.target as HTMLElement;
              const cardId = parseInt(cardElement.getAttribute('data-certificate-id') || '0');

              // Kart görünür alana girdiğinde yavaşça animate et
              setTimeout(() => {
                const certificate = this.certificates.find(c => c.id === cardId);
                if (certificate) {
                  certificate.isVisible = true;
                }
                cardElement.classList.add('certificate-animate-in');
              }, index * 100); // Her kart arasında 100ms gecikme

              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px', // 50px önce tetikle
          threshold: 0.1
        }
      );

      // Tüm sertifika kartlarını observe et
      setTimeout(() => {
        const certificateCards = this.elementRef.nativeElement.querySelectorAll('.certificate-card');
        certificateCards.forEach((card: Element) => {
          this.observer?.observe(card);
        });
      }, 100);
    }
  }

  get filteredCertificates() {
    if (this.selectedFilter === 'all') {
      return this.certificates;
    }
    return this.certificates.filter(cert => cert.category === this.selectedFilter);
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;

    // Filter değiştiğinde intersection observer'ı yeniden kur
    setTimeout(() => {
      // Eski observer'ı temizle
      if (this.observer) {
        this.observer.disconnect();
      }

      // Yeni filter için kartları sıfırla
      this.certificates.forEach(cert => {
        cert.isVisible = this.filteredCertificates.slice(0, 3).includes(cert);
      });

      // Yeni observer kur
      this.setupIntersectionObserver();
    }, 50);
  }

  getCategoryCount(category: string): number {
    if (category === 'all') return this.certificates.length;
    return this.certificates.filter(cert => cert.category === category).length;
  }

  getCategoryName(category: string): string {
    const names = {
      'all': 'Tümü',
      'reiki': 'Reiki',
      'accessbars': 'AccessBars',
      'theta': 'Theta Healing'
    };
    return names[category as keyof typeof names];
  }

  trackByCertificate(index: number, certificate: Certificate): number {
    return certificate.id;
  }

  // Lightbox Methods
  openLightbox(certificate: Certificate) {
    this.selectedCertificate = certificate;
    this.isLightboxOpen = true;
    document.body.style.overflow = 'hidden'; // Scroll'u engelle
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.selectedCertificate = null;
    document.body.style.overflow = 'auto'; // Scroll'u geri aç
  }

  onLightboxClick(event: Event) {
    // Lightbox backdrop'a tıklandığında kapat
    if (event.target === event.currentTarget) {
      this.closeLightbox();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeLightbox();
    }
  }

  // Görsel yükleme hatası için fallback
  onImageError(event: any) {
    event.target.style.display = 'none';
    // Emoji fallback gösterilecek
  }

  // Lazy loading için görsel loading
  onImageLoad(certificate: Certificate) {
    // Görsel yüklendiğinde fade-in efekti
    certificate.isVisible = true;
  }
}
