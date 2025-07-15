import { Routes } from '@angular/router';
import { ReplyComponent } from './components/reply/reply.component';
import { BlogComponent } from './components/blog/blog.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { AmpBlogComponent } from './components/amp-blog/amp-blog.component';
import { Component } from '@angular/core';

// Ana sayfa için boş component (sadece router'ın URL'i tanıması için)
@Component({
    template: '',
    standalone: true
})
export class HomeRouteComponent { }

export const routes: Routes = [
    {
        path: '',
        component: HomeRouteComponent,
        title: 'Gülseven Üçerler - Enerji Şifacılığı Uzmanı'
    },
    {
        path: 'blog',
        component: BlogComponent,
        title: 'Blog - Gülseven Üçerler'
    },
    {
        path: 'blog/:slug',
        component: BlogDetailComponent,
        title: 'Blog Yazısı - Gülseven Üçerler'
    },
    {
        path: 'amp/:slug',
        component: AmpBlogComponent,
        title: 'Blog Yazısı (AMP) - Gülseven Üçerler'
    },
    {
        path: 'reply',
        component: ReplyComponent,
        title: 'Yanıt Hazırlayıcı - Gülseven Üçerler',
        data: {
            excludeFromSitemap: true,
            robots: 'noindex, nofollow'
        }
    }
];
