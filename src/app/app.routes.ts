import { Routes } from '@angular/router';
import { ReplyComponent } from './components/reply/reply.component';

export const routes: Routes = [
    {
        path: 'reply',
        component: ReplyComponent,
        title: 'Yanıt Hazırlayıcı - Gülseven Üçerler'
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
    }
];
