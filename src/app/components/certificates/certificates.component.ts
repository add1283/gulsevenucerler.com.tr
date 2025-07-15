import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Certificate {
  id: number;
  title: string;
  year: string;
  category: 'reiki' | 'accessbars' | 'theta';
  image: string;
  fileUrl: string;
  description: string;
  isVisible?: boolean;
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
  isBrowser: boolean; // Public olarak değiştirildi

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  certificates: Certificate[] = [
    // Theta Healing Sertifikaları (6 adet - PNG) - En güncel ve kapsamlı
    {
      id: 1,
      title: 'Basic DNA Theta Healing',
      year: '2022',
      category: 'theta',
      image: '🧬',
      fileUrl: '/images/certificates/basic-dna-2022-teta.png',
      description: 'Temel DNA aktivasyonu ve inanç sistemi çalışmaları',
      isVisible: false
    },
    {
      id: 2,
      title: 'Advanced DNA Theta Healing',
      year: '2023',
      category: 'theta',
      image: '🧬',
      fileUrl: '/images/certificates/advanced-dna-2023-teta.png',
      description: 'İleri seviye DNA çalışmaları ve derinlemesine şifa teknikleri',
      isVisible: false
    },
    {
      id: 3,
      title: 'Derin Kazı - Theta Healing',
      year: '2023',
      category: 'theta',
      image: '🔍',
      fileUrl: '/images/certificates/derin-kazi-2023.png',
      description: 'Alt bilinçteki derin engelleri ortaya çıkarma ve temizleme',
      isVisible: false
    },
    {
      id: 4,
      title: 'Sen ve Yaratıcı - Theta Healing',
      year: '2023',
      category: 'theta',
      image: '🙏',
      fileUrl: '/images/certificates/sen-ve-yaratici-2023-teta.png',
      description: 'Yaratıcı enerji ile bağlantıyı güçlendirme ve spiritüel gelişim',
      isVisible: false
    },
    {
      id: 5,
      title: 'Kendini Sevmek - Theta Healing',
      year: '2024',
      category: 'theta',
      image: '💝',
      fileUrl: '/images/certificates/kendini-sevmek-2024-teta.png',
      description: 'Öz sevgi geliştirme ve iç iyileşme çalışmaları',
      isVisible: false
    },
    {
      id: 6,
      title: 'Sezgisel Anatomi - Theta Healing',
      year: '2024',
      category: 'theta',
      image: '🧠',
      fileUrl: '/images/certificates/sezgisel-anatomi-2024-Theta.png',
      description: 'Vücudun enerji sistemi ve sezgisel şifa teknikleri',
      isVisible: false
    },

    // Reiki Sertifikaları (3 adet - görsel)
    {
      id: 7,
      title: 'Reiki Usui Sistem 1. Aşama',
      year: '2018',
      category: 'reiki',
      image: '⚡',
      fileUrl: '/images/certificates/reiki-usi-sistem-1-asama-2018.jpg',
      description: 'Temel Reiki teknikleri ve enerji şifacılığına giriş eğitimi',
      isVisible: false
    },
    {
      id: 8,
      title: 'Reiki Usui Sistem 2A',
      year: '2018',
      category: 'reiki',
      image: '⚡',
      fileUrl: '/images/certificates/2018-reiki-usui-sistem-2a.jpg',
      description: 'İleri Reiki sembolleri ve uzaktan şifa teknikleri',
      isVisible: false
    },
    {
      id: 9,
      title: 'Reiki Usui Sistem 2B',
      year: '2018',
      category: 'reiki',
      image: '⚡',
      fileUrl: '/images/certificates/reiki-usui-sistem-2b.jpg',
      description: 'Reiki ikinci seviye ileri teknikleri ve uygulamaları',
      isVisible: false
    },

    // AccessBars Sertifikası (1 adet - görsel)
    {
      id: 10,
      title: 'AccessBars Sertifikası',
      year: '2020',
      category: 'accessbars',
      image: '🔓',
      fileUrl: '/images/certificates/accessBars.jpg',
      description: 'Kafadaki 32 noktaya dokunarak zihinsel engelleri kaldırma tekniği',
      isVisible: false
    }
  ];

  ngOnInit() {
    // İlk 6 kartı hemen göster (daha fazla initial loading)
    this.certificates.slice(0, 6).forEach(cert => cert.isVisible = true);

    // Critical images preload
    if (this.isBrowser) {
      this.preloadCriticalImages();
    }
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private preloadCriticalImages() {
    // İlk 3 sertifikanın görsellerini preload et
    const criticalCertificates = this.certificates.slice(0, 3);

    criticalCertificates.forEach(cert => {
      if (cert.fileUrl) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = cert.fileUrl;
        document.head.appendChild(link);
      }
    });
  }

  setupIntersectionObserver() {
    if (!this.isBrowser) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const certificateElement = entry.target as HTMLElement;
          const certificateId = parseInt(certificateElement.getAttribute('data-certificate-id') || '0');
          const certificate = this.certificates.find(c => c.id === certificateId);

          if (certificate && !certificate.isVisible) {
            // Daha hızlı animation için delay azaltıldı
            setTimeout(() => {
              certificate.isVisible = true;
            }, index * 100); // 200ms'den 100ms'e düşürüldü
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px' // Daha geniş margin ile önceden yükleme
    });

    // Certificate kartlarını gözlemle
    const certificateCards = this.elementRef.nativeElement.querySelectorAll('.certificate-card');
    certificateCards.forEach((card: Element) => {
      this.observer?.observe(card);
    });
  }

  // Kategori isimlerini Türkçe'ye çevir
  getCategoryName(category: string): string {
    switch (category) {
      case 'all': return 'Tümü';
      case 'reiki': return 'Reiki';
      case 'accessbars': return 'Access Bars';
      case 'theta': return 'Theta Healing';
      default: return category;
    }
  }

  // Filtreleme
  filterCertificates(category: string) {
    this.selectedFilter = category;
  }

  get filteredCertificates() {
    if (this.selectedFilter === 'all') {
      return this.certificates;
    }
    return this.certificates.filter(cert => cert.category === this.selectedFilter);
  }

  // Kategori sayıları
  get categoryCounts() {
    return {
      all: this.certificates.length,
      reiki: this.certificates.filter(c => c.category === 'reiki').length,
      accessbars: this.certificates.filter(c => c.category === 'accessbars').length,
      theta: this.certificates.filter(c => c.category === 'theta').length
    };
  }

  // Lightbox
  openLightbox(certificate: Certificate) {
    this.selectedCertificate = certificate;
    this.isLightboxOpen = true;

    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.selectedCertificate = null;

    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      this.previousCertificate();
    } else if (event.key === 'ArrowRight') {
      this.nextCertificate();
    }
  }

  // Image error handling
  onImageError(event: any) {
    console.warn('Image failed to load:', event.target.src);
    // Emoji fallback gösterilecek
  }

  // Lazy loading için görsel loading
  onImageLoad(certificate: Certificate) {
    // Görsel yüklendiğinde fade-in efekti
    certificate.isVisible = true;
  }

  // Sertifika dosya URL'sini al
  getCertificateFileUrl(certificate: Certificate): string {
    return certificate.fileUrl || '';
  }

  // Lightbox navigation metodları
  nextCertificate() {
    if (!this.selectedCertificate) return;

    const certificates = this.filteredCertificates;
    const currentIndex = certificates.findIndex(cert => cert.id === this.selectedCertificate!.id);
    const nextIndex = (currentIndex + 1) % certificates.length;
    this.selectedCertificate = certificates[nextIndex];
  }

  previousCertificate() {
    if (!this.selectedCertificate) return;

    const certificates = this.filteredCertificates;
    const currentIndex = certificates.findIndex(cert => cert.id === this.selectedCertificate!.id);
    const previousIndex = (currentIndex - 1 + certificates.length) % certificates.length;
    this.selectedCertificate = certificates[previousIndex];
  }
}
