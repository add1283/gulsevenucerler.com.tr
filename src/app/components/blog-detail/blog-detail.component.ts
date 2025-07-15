import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

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

    async loadBlogPost(slug: string) {
        try {
            if (!this.isBrowser) return;

            const response = await fetch('/assets/blog-data.json');
            if (!response.ok) throw new Error('Blog data not found');

            const blogPosts: BlogPost[] = await response.json();
            this.post = blogPosts.find(p => p.slug === slug) || null;

            if (this.post) {
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
}
