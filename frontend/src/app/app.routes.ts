// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  { 
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        // This replaces the old direct DashboardComponent import
        loadComponent: () => import('./features/dashboard/dashboard-summary/dashboard-summary.component').then(m => m.DashboardSummaryComponent)
      },
      // Future routes to be implemented:
      { 
        path: 'book', 
        loadComponent: () => import('./features/booking/booking-flow/booking-flow.component').then(m => m.BookingFlowComponent)
      },
      { 
        path: 'shipments', 
        loadComponent: () => import('./features/shipments/shipment-list/shipment-list').then(m => m.ShipmentListComponent)
      },
      { 
        // Detail route using parameter :id
        path: 'shipments/:id', 
        loadComponent: () => import('./features/shipments/shipment-tracking/shipment-tracking').then(m => m.ShipmentTrackingComponent)
      },
      { 
        path: 'wallet', 
        loadComponent: () => import('./features/wallet/wallet-view/wallet-view').then(m => m.WalletViewComponent)
      },
    ]
  },
  
  { path: '**', redirectTo: 'login' }
];