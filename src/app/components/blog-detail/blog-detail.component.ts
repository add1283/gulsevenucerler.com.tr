import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import baguetteBox from 'baguettebox.js';
import 'baguettebox.js/dist/baguetteBox.min.css';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  publishedDate: string;
  readTime: number;
  originalUrl: string;
  image?: string;
}

interface BlogData {
  posts: BlogPost[];
  lastUpdated: string;
  totalPosts: number;
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogDetailComponent implements OnInit {
  post: BlogPost | null = null;
  private isBrowser: boolean;
  copied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.loadBlogPost(params['slug']);
      }
    });
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.setupLightbox();
    // BaguetteBox ile lightbox başlat
    setTimeout(() => {
      const gallery = document.querySelector('.prose');
      if (gallery) {
        baguetteBox.run('.prose', {
          captions: true,
          buttons: 'auto',
          animation: 'fadeIn',
        });
      }
    }, 0);
  }

  ngOnChanges() {
    if (!this.isBrowser) return;
    this.setupLightbox();
  }

  /**
   * Blog post içeriğini işler: img'lere lazyload ve lightbox, her türlü img'yi lightbox'a çevirir, sosyal medya linklerini embed'e çevirir
   */
  processContent(rawContent: string): string {
    let content = rawContent;

    // <a> içinde img olanları lightbox ve style ile güncelle (varsa class ve data-lightbox ekle)
    content = content.replace(/<a([^>]*?)href=["']([^"']+)["']([^>]*?)>(\s*)<img([^>]*?)src=["']([^"']+)["']([^>]*?)>(\s*)<\/a>/gi,
      function (match: string, beforeA: string, href: string, afterHref: string, space1: string, beforeImg: string, src: string, afterImg: string, space2: string): string {
        let aAttrs = beforeA + ` href="${src}"` + afterHref;
        if (!/data-lightbox="blog"/.test(aAttrs)) aAttrs += ' data-lightbox="blog"';
        if (!/class="gallery-item"/.test(aAttrs)) aAttrs += ' class="gallery-item"';
        let imgTag = `<img${beforeImg} src="${src}"${afterImg} loading="lazy" style="width:100%;height:auto;" />`;
        return `<a${aAttrs}>${space1}${imgTag}${space2}</a>`;
      });

    // Bağımsız img'leri de <a> ile sar
    content = content.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, function (match: string, beforeSrc: string, src: string, afterSrc: string): string {
      if (match.includes('data-lightbox="blog"')) return match;
      let imgTag = `<img${beforeSrc} src="${src}"${afterSrc} loading="lazy" style="width:100%;height:auto;" />`;
      return `<a href="${src}" data-lightbox="blog" class="gallery-item">${imgTag}</a>`;
    });

    // YouTube embed'leri aspect-ratio ile güncelle
    content = content.replace(/<div class="youtube-embed">(.*?)<iframe(.*?)><\/iframe>(.*?)<\/div>/gi, function (match: string, beforeIframe: string, iframeAttrs: string, afterIframe: string): string {
      return `<div class="youtube-embed" style="aspect-ratio:16/9;max-width:100%;"><iframe${iframeAttrs} style="width:100%;height:100%;" allowfullscreen loading="lazy"></iframe></div>`;
    });

    // X (Twitter): tweet linklerini embed koduna çevir
    content = content.replace(/https?:\/\/(www\.)?twitter\.com\/(\w+)\/status\/(\d+)/gi, (url, www, user, tweetId) => {
      return `<blockquote class="twitter-tweet"><a href="${url}" target="_blank">Tweet</a></blockquote>`;
    });

    // Instagram: gönderi linklerini embed koduna çevir
    content = content.replace(/https?:\/\/(www\.)?instagram\.com\/p\/([\w-]+)/gi, (url, www, postId) => {
      return `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"><a href="${url}" target="_blank">Instagram</a></blockquote>`;
    });

    return content;
  }

  async loadBlogPost(slug: string) {
    try {
      if (!this.isBrowser) return;

      const response = await fetch('/assets/blog-data.json');
      if (!response.ok) throw new Error('Blog data not found');

      const blogPosts: BlogPost[] = await response.json();
      this.post = blogPosts.find(p => p.slug === slug) || null;

      if (this.post) {
        // İçeriği işle
        this.post.content = this.processContent(this.post.content);
        this.updateSEO();
        this.addStructuredData();
      }

      // Change detection'ı manuel trigger et
      this.cdr.markForCheck();

    } catch (error) {
      console.error('Error loading blog post:', error);
    }
  }

  goToBlog() {
    this.router.navigate(['/blog']);
  }

  goToPost(post: BlogPost) {
    this.router.navigate(['/blog', post.slug]);
  }

  openOriginalPost() {
    if (this.post?.originalUrl && this.isBrowser) {
      window.open(this.post.originalUrl, '_blank');
    }
  }

  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Social sharing methods
  async shareNative() {
    if (!this.post || !this.isBrowser) return;

    const shareData = {
      title: this.post.title,
      text: this.post.excerpt,
      url: `https://gulsevenucerler.com.tr/blog/${this.post.slug}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Native share canceled or failed:', error);
        // Fallback: copy to clipboard
        this.copyToClipboard();
      }
    } else {
      // Fallback: copy to clipboard
      this.copyToClipboard();
    }
  }

  shareWhatsApp() {
    if (!this.post || !this.isBrowser) return;

    const text = `${this.post.title}\n\n${this.post.excerpt}\n\n`;
    const url = `https://gulsevenucerler.com.tr/blog/${this.post.slug}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + url)}`;

    window.open(whatsappUrl, '_blank');
  }

  shareFacebook() {
    if (!this.post || !this.isBrowser) return;

    const url = `https://gulsevenucerler.com.tr/blog/${this.post.slug}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }

  shareX() {
    if (!this.post || !this.isBrowser) return;

    const text = `${this.post.title}\n\n${this.post.excerpt}`;
    const url = `https://gulsevenucerler.com.tr/blog/${this.post.slug}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }

  private async copyToClipboard() {
    if (!this.post || !this.isBrowser) return;

    const text = `${this.post.title}\n\n${this.post.excerpt}\n\nhttps://gulsevenucerler.com.tr/blog/${this.post.slug}`;

    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
      console.log('Link copied to clipboard');
    } catch (error) {
      console.log('Failed to copy to clipboard:', error);
    }
  }

  copyLink() {
    if (!this.post || !this.isBrowser) return;
    const url = `https://gulsevenucerler.com.tr/blog/${this.post.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.copied = false;
        this.cdr.markForCheck();
      }, 2000);
    });
  }

  get canUseNativeShare(): boolean {
    return this.isBrowser && !!navigator.share;
  }

  private updateSEO() {
    if (!this.post) return;

    // Sayfa başlığını güncelle
    this.titleService.setTitle(`${this.post.title} - Gülseven Üçerler Blog`);

    // Meta taglerini güncelle
    this.meta.updateTag({ name: 'description', content: this.post.excerpt });
    this.meta.updateTag({ property: 'og:title', content: this.post.title });
    this.meta.updateTag({ property: 'og:description', content: this.post.excerpt });
    this.meta.updateTag({ property: 'og:image', content: `https://gulsevenucerler.com.tr${this.post.image}` });
    this.meta.updateTag({ property: 'og:url', content: `https://gulsevenucerler.com.tr/blog/${this.post.slug}` });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: this.post.title });
    this.meta.updateTag({ name: 'twitter:description', content: this.post.excerpt });
    this.meta.updateTag({ name: 'twitter:image', content: `https://gulsevenucerler.com.tr${this.post.image}` });

    // Canonical link ekle
    this.meta.updateTag({ rel: 'canonical', href: `https://gulsevenucerler.com.tr/blog/${this.post.slug}` });

    // AMP link ekle
    this.meta.updateTag({ rel: 'amphtml', href: `https://gulsevenucerler.com.tr/amp/${this.post.slug}` });
  }

  private addStructuredData() {
    if (!this.post || !this.isBrowser) return;

    // Önceki structured data varsa kaldır
    const existingScript = this.document.getElementById('blog-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Article structured data
    const articleStructuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": this.post.title,
      "description": this.post.excerpt,
      "image": [
        {
          "@type": "ImageObject",
          "url": `https://gulsevenucerler.com.tr${this.post.image}`,
          "width": 1200,
          "height": 630
        },
        {
          "@type": "ImageObject",
          "url": `https://gulsevenucerler.com.tr${this.post.image}`,
          "width": 800,
          "height": 600
        },
        {
          "@type": "ImageObject",
          "url": `https://gulsevenucerler.com.tr${this.post.image}`,
          "width": 400,
          "height": 300
        }
      ],
      "datePublished": this.post.publishedAt,
      "dateModified": this.post.publishedAt,
      "author": {
        "@type": "Person",
        "name": "Gülseven Üçerler",
        "url": "https://gulsevenucerler.com.tr",
        "image": {
          "@type": "ImageObject",
          "url": "https://gulsevenucerler.com.tr/images/profile-picture.jpg",
          "width": 400,
          "height": 400
        },
        "jobTitle": "Enerji Şifacılığı Uzmanı",
        "worksFor": {
          "@type": "Organization",
          "name": "Gülseven Üçerler"
        },
        "sameAs": [
          "https://www.linkedin.com/in/gulsevenucerler",
          "https://gulsevenucerler.com.tr"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Gülseven Üçerler",
        "url": "https://gulsevenucerler.com.tr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://gulsevenucerler.com.tr/images/social-image.png",
          "width": 1200,
          "height": 630
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "TR",
          "addressLocality": "İstanbul"
        },
        "sameAs": [
          "https://www.linkedin.com/in/gulsevenucerler"
        ]
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://gulsevenucerler.com.tr/blog/${this.post.slug}`
      },
      "articleSection": "Enerji Şifacılığı",
      "keywords": ["theta healing", "reiki", "enerji şifacılığı", "kişisel gelişim", "meditasyon", "accessbars"],
      "wordCount": this.post.content.split(' ').length,
      "timeRequired": `PT${this.post.readTime}M`,
      "isAccessibleForFree": true,
      "inLanguage": "tr-TR",
      "potentialAction": {
        "@type": "ReadAction",
        "target": `https://gulsevenucerler.com.tr/blog/${this.post.slug}`
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".prose h1", ".prose h2", ".prose p"]
      }
    };

    // BreadcrumbList structured data
    const breadcrumbStructuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Ana Sayfa",
          "item": "https://gulsevenucerler.com.tr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://gulsevenucerler.com.tr/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": this.post.title,
          "item": `https://gulsevenucerler.com.tr/blog/${this.post.slug}`
        }
      ]
    };

    // Website structured data
    const websiteStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Gülseven Üçerler",
      "url": "https://gulsevenucerler.com.tr",
      "description": "Enerji şifacılığı, Teta Healing, Reiki ve AccessBars ile şifa hizmetleri",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://gulsevenucerler.com.tr/blog?search={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://www.linkedin.com/in/gulsevenucerler"
      ]
    };

    // Combine all structured data
    const combinedStructuredData = {
      "@context": "https://schema.org",
      "@graph": [
        articleStructuredData,
        breadcrumbStructuredData,
        websiteStructuredData
      ]
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-structured-data';
    script.textContent = JSON.stringify(combinedStructuredData);
    this.document.head.appendChild(script);
  }

  private setupLightbox() {
    setTimeout(() => {
      const container = document.querySelector('.prose');
      if (!container) return;
      const imgs = container.querySelectorAll('img[data-lightbox="blog"]');
      imgs.forEach(img => {
        const image = img as HTMLImageElement;
        image.addEventListener('click', (e: Event) => {
          e.preventDefault();
          this.openLightbox(image.src, image.alt);
        });
        image.style.cursor = 'zoom-in';
      });
    }, 0);
  }

  private openLightbox(src: string, alt: string) {
    // Lightbox overlay
    const overlay: HTMLDivElement = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'zoom-out';
    overlay.style.transition = 'opacity 0.2s';
    overlay.tabIndex = 0;

    // Image
    const img: HTMLImageElement = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '90vh';
    img.style.borderRadius = '1rem';
    img.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
    img.style.background = '#fff';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    img.style.margin = 'auto';

    overlay.appendChild(img);
    document.body.appendChild(overlay);
    overlay.focus();

    // Kapatma fonksiyonu
    const close = () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 200);
    };
    overlay.addEventListener('click', close);
    overlay.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    });
  }
}
