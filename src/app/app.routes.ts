import { Routes } from '@angular/router';
import { ReplyComponent } from './components/reply/reply.component';
import { BlogComponent } from './components/blog/blog.component';
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
        path: 'reply',
        component: ReplyComponent,
        title: 'Yanıt Hazırlayıcı - Gülseven Üçerler',
        data: {
            excludeFromSitemap: true,
            robots: 'noindex, nofollow'
        }
    }
];
