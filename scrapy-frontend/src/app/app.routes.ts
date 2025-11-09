import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { UserComponent } from './features/user/user.component';
import { HistoryComponent } from './features/history/history.component';
import { SearchQueriesComponent } from './features/history/search-queries/search-queries.component';
import { SearchQueryComponent } from './features/history/search-query/search-query.component';
import { SearchComponent } from './features/search/search.component';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import { authGuard, loginGuard } from './core/services/auth';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'search',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: SearchComponent,
      },
      {
        path: ':searchId',
        component: SearchComponent,
      },
    ],
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [authGuard],
  },
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'search-queries',
        pathMatch: 'full',
      },
      {
        path: 'search-queries',
        component: SearchQueriesComponent,
      },
      {
        path: 'search-queries/:searchId',
        component: SearchQueryComponent,
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
