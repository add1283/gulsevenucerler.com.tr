import { Component, OnInit, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

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
    loading = true;
    error = false;
    currentYear = new Date().getFullYear();
    private isBrowser: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private meta: Meta,
        private titleService: Title,
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

    async loadBlogPost(slug: string) {
        try {
            if (!this.isBrowser) return;

            const response = await fetch('/blog-data.json');
            if (!response.ok) throw new Error('Blog data not found');

            const blogPosts: BlogPost[] = await response.json();

            // Slug'a göre post bul
            this.post = blogPosts.find(p => p.slug === slug) || null;

            if (!this.post) {
                this.error = true;
                this.loading = false;
                return;
            }

            // SEO ve structured data güncellemeleri
            this.updateAmpSEO();
            this.addAmpStructuredData();

            this.loading = false;

        } catch (error) {
            console.error('Error loading blog post:', error);
            this.error = true;
            this.loading = false;
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

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": this.post.title,
            "description": this.post.excerpt,
            "image": {
                "@type": "ImageObject",
                "url": `https://gulsevenucerler.com.tr${this.post.image}`,
                "width": 1200,
                "height": 630
            },
            "datePublished": this.post.publishedAt,
            "dateModified": this.post.publishedAt,
            "author": {
                "@type": "Person",
                "name": "Gülseven Üçerler",
                "url": "https://gulsevenucerler.com.tr",
                "sameAs": [
                    "https://www.linkedin.com/in/gulsevenucerler"
                ]
            },
            "publisher": {
                "@type": "Organization",
                "name": "Gülseven Üçerler",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://gulsevenucerler.com.tr/images/social-image.png",
                    "width": 1200,
                    "height": 630
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://gulsevenucerler.com.tr/amp/${this.post.slug}`
            },
            "articleSection": "Enerji Şifacılığı",
            "keywords": ["theta healing", "reiki", "enerji şifacılığı", "kişisel gelişim", "meditasyon", "amp"],
            "wordCount": this.post.content.split(' ').length,
            "timeRequired": `PT${this.post.readTime}M`,
            "isAccessibleForFree": true,
            "url": `https://gulsevenucerler.com.tr/amp/${this.post.slug}`
        };

        const script = this.document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'amp-structured-data';
        script.textContent = JSON.stringify(structuredData);
        this.document.head.appendChild(script);
    }
}
