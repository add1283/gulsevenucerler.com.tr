import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NgZone } from '@angular/core';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  ampContent: string;
  publishedAt: string;
  publishedDate: string;
  readTime: number;
  originalUrl: string;
  image?: string;
}

@Component({
  selector: 'app-amp-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amp-blog.component.html',
  styleUrl: './amp-blog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmpBlogComponent implements OnInit {
  post: BlogPost | null = null;
  currentYear = new Date().getFullYear();
  private isBrowser: boolean;
  ampShareHtml: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private titleService: Title,
    private ngZone: NgZone,
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

  /**
   * AMP için içerik işleme: img -> amp-img + amp-lightbox, YouTube -> amp-youtube, X/Instagram -> amp embed
   */
  processAmpContent(rawContent: string): string {
    let content = rawContent;
    // IMG: amp-img ve amp-lightbox
    content = content.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (match, beforeSrc, src, afterSrc) => {
      // amp-img'i amp-lightbox ile sarmala
      return `<amp-lightbox id='lightbox-${src.replace(/[^\w]/g, "")}' layout='nodisplay'>
                <div style='display:flex;align-items:center;justify-content:center;height:100vh;background:rgba(0,0,0,0.95);'>
                    <amp-img src='${src}' width='900' height='600' layout='responsive' alt='' style='max-width:90vw;max-height:90vh;border-radius:1rem;box-shadow:0 8px 32px rgba(0,0,0,0.5);background:#fff;object-fit:contain;'></amp-img>
                </div>
            </amp-lightbox>
            <amp-img src='${src}' width='600' height='400' layout='responsive' alt='' on='tap:lightbox-${src.replace(/[^\w]/g, "")}' role='button' tabindex='0' style='cursor:zoom-in;' />`;
    });
    // YouTube: amp-youtube
    content = content.replace(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/gi, (url, www, type, id) => {
      return `<amp-youtube data-videoid='${id}' layout='responsive' width='480' height='270'></amp-youtube>`;
    });
    // X (Twitter): amp-twitter
    content = content.replace(/https?:\/\/(www\.)?twitter\.com\/(\w+)\/status\/(\d+)/gi, (url, www, user, tweetId) => {
      return `<amp-twitter width='375' height='472' layout='responsive' data-tweetid='${tweetId}'></amp-twitter>`;
    });
    // Instagram: amp-instagram
    content = content.replace(/https?:\/\/(www\.)?instagram\.com\/p\/([\w-]+)/gi, (url, www, postId) => {
      return `<amp-instagram data-shortcode='${postId}' width='400' height='400' layout='responsive'></amp-instagram>`;
    });
    return content;
  }

  generateAmpShareHtml(): string {
    if (!this.post) return '';
    const url = `https://gulsevenucerler.com.tr/amp/${this.post.slug}`;
    const title = this.post.title;
    const excerpt = this.post.excerpt;
    return `
          <div class='amp-share-buttons' style='display:flex;gap:12px;justify-content:center;margin:24px 0;'>
            <a class='amp-btn-primary' style='text-decoration:none;' href='https://wa.me/?text=${encodeURIComponent(title + '\n' + excerpt + '\n' + url)}' target='_blank' rel='noopener'>WhatsApp</a>
            <a class='amp-btn-primary' style='text-decoration:none;' href='https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}' target='_blank' rel='noopener'>Facebook</a>
            <a class='amp-btn-primary' style='text-decoration:none;' href='https://twitter.com/intent/tweet?text=${encodeURIComponent(title + '\n' + excerpt)}&url=${encodeURIComponent(url)}' target='_blank' rel='noopener'>X</a>
            <a class='amp-btn-primary' style='text-decoration:none;' href='mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}' target='_blank' rel='noopener'>E-posta</a>
          </div>
        `;
  }

  async loadBlogPost(slug: string) {
    try {
      if (!this.isBrowser) {
        return;
      }
      const response = await fetch('/assets/blog-data.json');
      if (!response.ok) throw new Error('Blog data not found');
      const blogPosts: BlogPost[] = await response.json();
      this.post = blogPosts.find(p => p.slug === slug) || null;
      if (this.post) {
        this.post.ampContent = this.processAmpContent(this.post.content);
        this.ampShareHtml = this.generateAmpShareHtml();
        this.updateAmpSEO();
        this.addAmpStructuredData();
      }
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading blog post:', error);
    }
  }

  goToOriginalArticle() {
    if (this.post && this.isBrowser) {
      window.location.href = `/blog/${this.post.slug}`;
    }
  }

  openOriginalPost() {
    if (this.post?.originalUrl && this.isBrowser) {
      window.open(this.post.originalUrl, '_blank');
    }
  }

  private updateAmpSEO() {
    if (!this.post) return;

    // Sayfa başlığını güncelle
    this.titleService.setTitle(`${this.post.title} - Gülseven Üçerler Blog (AMP)`);

    // AMP specific meta taglar
    this.meta.updateTag({ name: 'description', content: this.post.excerpt });
    this.meta.updateTag({ property: 'og:title', content: this.post.title });
    this.meta.updateTag({ property: 'og:description', content: this.post.excerpt });
    this.meta.updateTag({ property: 'og:image', content: `https://gulsevenucerler.com.tr${this.post.image}` });
    this.meta.updateTag({ property: 'og:url', content: `https://gulsevenucerler.com.tr/amp/${this.post.slug}` });
    this.meta.updateTag({ property: 'og:type', content: 'article' });

    // Canonical link (normal sayfaya)
    this.meta.updateTag({ rel: 'canonical', href: `https://gulsevenucerler.com.tr/blog/${this.post.slug}` });
  }

  private addAmpStructuredData() {
    if (!this.post || !this.isBrowser) return;

    // Önceki structured data varsa kaldır
    const existingScript = this.document.getElementById('amp-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // AMP Article structured data
    const ampArticleStructuredData = {
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
        "@id": `https://gulsevenucerler.com.tr/amp/${this.post.slug}`
      },
      "articleSection": "Enerji Şifacılığı",
      "keywords": ["theta healing", "reiki", "enerji şifacılığı", "kişisel gelişim", "meditasyon", "amp", "accessbars"],
      "wordCount": this.post.content.split(' ').length,
      "timeRequired": `PT${this.post.readTime}M`,
      "isAccessibleForFree": true,
      "inLanguage": "tr-TR",
      "url": `https://gulsevenucerler.com.tr/amp/${this.post.slug}`,
      "potentialAction": {
        "@type": "ReadAction",
        "target": `https://gulsevenucerler.com.tr/amp/${this.post.slug}`
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".amp-article h1", ".amp-article h2", ".amp-article p"]
      },
      // AMP-specific properties
      "ampVersion": "1.0",
      "alternativeHeadline": this.post.excerpt,
      "about": {
        "@type": "Thing",
        "name": "Enerji Şifacılığı",
        "description": "Theta Healing, Reiki ve AccessBars ile enerji iyileştirme teknikleri"
      }
    };

    // AMP BreadcrumbList structured data
    const ampBreadcrumbStructuredData = {
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
          "item": `https://gulsevenucerler.com.tr/amp/${this.post.slug}`
        }
      ]
    };

    // AMP Website structured data
    const ampWebsiteStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Gülseven Üçerler (AMP)",
      "url": "https://gulsevenucerler.com.tr",
      "description": "Enerji şifacılığı, Teta Healing, Reiki ve AccessBars ile şifa hizmetleri - Hızlı AMP sürümü",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://gulsevenucerler.com.tr/blog?search={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://www.linkedin.com/in/gulsevenucerler"
      ]
    };

    // Organization structured data
    const organizationStructuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Gülseven Üçerler",
      "url": "https://gulsevenucerler.com.tr",
      "logo": "https://gulsevenucerler.com.tr/images/social-image.png",
      "description": "Profesyonel enerji şifacılığı hizmetleri",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR",
        "addressLocality": "İstanbul"
      },
      "founder": {
        "@type": "Person",
        "name": "Gülseven Üçerler"
      },
      "sameAs": [
        "https://www.linkedin.com/in/gulsevenucerler"
      ]
    };

    // Combine all AMP structured data
    const combinedAmpStructuredData = {
      "@context": "https://schema.org",
      "@graph": [
        ampArticleStructuredData,
        ampBreadcrumbStructuredData,
        ampWebsiteStructuredData,
        organizationStructuredData
      ]
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'amp-structured-data';
    script.textContent = JSON.stringify(combinedAmpStructuredData);
    this.document.head.appendChild(script);
  }
}
