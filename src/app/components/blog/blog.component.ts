import { Component, OnInit, NgZone, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
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
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  searchTerm = '';
  private isBrowser: boolean;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = typeof window !== 'undefined';
  }

  ngOnInit() {
    this.loadBlogData();
  }

  async loadBlogData() {
    try {
      if (!this.isBrowser) {
        return;
      }

      const response = await fetch('/assets/blog-data.json');

      if (!response.ok) throw new Error('Blog data not found');

      const allPosts: BlogPost[] = await response.json();

      // Sadece son 12 post'u göster (performans için)
      this.posts = allPosts.slice(0, 12);

      // Change detection'ı manuel trigger et
      this.cdr.markForCheck();

      // Structured data ekle
      this.addBlogListStructuredData();

    } catch (error) {
      console.error('Error loading blog data:', error);
    }
  }

  private addBlogListStructuredData() {
    if (!this.isBrowser || this.posts.length === 0) return;

    // Önceki structured data varsa kaldır
    const existingScript = this.document.getElementById('blog-list-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Blog listing structured data
    const blogListStructuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Enerji Şifacılığı Blog",
      "description": "Theta Healing, Reiki, AccessBars ve enerji şifacılığı hakkında güncel yazılar ve deneyimler",
      "url": "https://gulsevenucerler.com.tr/blog",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": this.posts.length,
        "itemListElement": this.posts.map((post, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "image": {
              "@type": "ImageObject",
              "url": `https://gulsevenucerler.com.tr${post.image}`,
              "width": 1200,
              "height": 630
            },
            "datePublished": post.publishedAt,
            "dateModified": post.publishedAt,
            "author": {
              "@type": "Person",
              "name": "Gülseven Üçerler",
              "url": "https://gulsevenucerler.com.tr"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Gülseven Üçerler",
              "logo": {
                "@type": "ImageObject",
                "url": "https://gulsevenucerler.com.tr/images/social-image.png"
              }
            },
            "url": `https://gulsevenucerler.com.tr/blog/${post.slug}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://gulsevenucerler.com.tr/blog/${post.slug}`
            }
          }
        }))
      }
    };

    // BreadcrumbList for blog page
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
      }
    };

    // Combine all structured data
    const combinedStructuredData = {
      "@context": "https://schema.org",
      "@graph": [
        blogListStructuredData,
        breadcrumbStructuredData,
        websiteStructuredData
      ]
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-list-structured-data';
    script.textContent = JSON.stringify(combinedStructuredData);
    this.document.head.appendChild(script);
  }

  // Debug helpers
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getCurrentUrl(): string {
    return this.isBrowser ? window.location.href : 'SSR';
  }

  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
