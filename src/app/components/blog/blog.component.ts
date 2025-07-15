import { Component, OnInit, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
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
    styleUrl: './blog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogComponent implements OnInit {
    posts: BlogPost[] = [];
    filteredPosts: BlogPost[] = [];
    loading = true;
    error = false;

    // Pagination
    currentPage = 1;
    postsPerPage = 6;
    totalPages = 0;

    private isBrowser: boolean;

    constructor(
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit() {
        this.loadBlogData();
    }

    async loadBlogData() {
        try {
            if (!this.isBrowser) return;

            const response = await fetch('/blog-data.json');
            if (!response.ok) throw new Error('Blog data not found');

            const blogPosts: BlogPost[] = await response.json();
            this.posts = blogPosts;
            this.filteredPosts = [...this.posts];
            this.updatePagination();
            this.loading = false;
        } catch (error) {
            console.error('Error loading blog data:', error);
            this.error = true;
            this.loading = false;
        }
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
    }

    get paginatedPosts() {
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        return this.filteredPosts.slice(startIndex, endIndex);
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.scrollToTop();
        }
    }

    goToPost(post: BlogPost) {
        this.router.navigate(['/blog', post.slug]);
    }

    scrollToTop() {
        if (this.isBrowser) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    get pageNumbers() {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(this.totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }
}
