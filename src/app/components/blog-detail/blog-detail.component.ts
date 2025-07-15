import { Component, OnInit, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
    imports: [CommonModule],
    templateUrl: './blog-detail.component.html',
    styleUrl: './blog-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogDetailComponent implements OnInit {
    post: BlogPost | null = null;
    loading = true;
    error = false;
    relatedPosts: BlogPost[] = [];

    private isBrowser: boolean;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const slug = params['slug'];
            if (slug) {
                this.loadBlogPost(slug);
            }
        });
    }

    async loadBlogPost(slug: string) {
        try {
            if (!this.isBrowser) return;

            const response = await fetch('/blog-data.json');
            if (!response.ok) throw new Error('Blog data not found');

            const blogData: BlogData = await response.json();

            // Slug'a göre post bul
            this.post = blogData.posts.find(p => p.slug === slug) || null;

            if (!this.post) {
                this.error = true;
                this.loading = false;
                return;
            }

            // İlgili yazıları bul (aynı kategoride veya rastgele 3 yazı)
            this.relatedPosts = blogData.posts
                .filter(p => p.slug !== slug)
                .slice(0, 3);

            this.loading = false;

            // Scroll to top
            this.scrollToTop();

        } catch (error) {
            console.error('Error loading blog post:', error);
            this.error = true;
            this.loading = false;
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
}
