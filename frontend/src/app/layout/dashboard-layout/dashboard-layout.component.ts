// frontend/src/app/layout/dashboard-layout/dashboard-layout.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      
      <!-- Mobile Sidebar Backdrop -->
      <div *ngIf="isMobileMenuOpen()" 
           class="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
           (click)="toggleMobileMenu()"></div>

      <!-- Sidebar -->
      <aside [class.translate-x-0]="isMobileMenuOpen()"
             [class.-translate-x-full]="!isMobileMenuOpen()"
             class="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:w-64 lg:flex-col shadow-xl">
        
        <div class="flex items-center justify-center h-16 bg-slate-950 px-4 border-b border-slate-800">
          <span class="text-white text-lg font-bold tracking-wider flex items-center gap-2">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            SOLORA LOGISTICS
          </span>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <!-- Navigation Links -->
          <a *ngFor="let link of navLinks" 
             [routerLink]="link.path" 
             routerLinkActive="bg-primary text-white"
             [routerLinkActiveOptions]="{exact: link.exact}"
             (click)="closeMobileMenu()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
            <span [innerHTML]="link.icon" class="w-5 h-5 flex-shrink-0"></span>
            <span class="font-medium">{{ link.label }}</span>
          </a>
        </nav>

        <!-- User Profile & Logout at Bottom -->
        <div class="p-4 bg-slate-950 border-t border-slate-800">
          <div class="flex items-center gap-3 mb-4" *ngIf="authService.currentUser$ | async as user">
            <img [src]="user.photoURL || 'https://ui-avatars.com/api/?name=' + user.displayName + '&background=4f46e5&color=fff'" 
                 alt="Avatar" 
                 class="w-10 h-10 rounded-full border-2 border-slate-700">
            <div class="overflow-hidden">
              <p class="text-sm font-medium text-white truncate">{{ user.displayName }}</p>
              <p class="text-xs text-slate-400 truncate">{{ user.email }}</p>
            </div>
          </div>
          <button (click)="onLogout()" 
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 bg-slate-900 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content Wrapper -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navbar for Mobile -->
        <header class="bg-white border-b border-slate-200 lg:hidden flex items-center justify-between h-16 px-4 shrink-0">
          <span class="font-bold text-slate-800">Solora Logistics</span>
          <button (click)="toggleMobileMenu()" class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">
          <div class="max-w-6xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
      
    </div>
  `
})
export class DashboardLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  
  isMobileMenuOpen = signal(false);

  // SVG Icons mapped for each route
  navLinks = [
    { path: '/dashboard', label: 'Dashboard', exact: true, icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' },
    { path: '/dashboard/book', label: 'Book Shipment', exact: false, icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>' },
    { path: '/dashboard/shipments', label: 'My Shipments', exact: false, icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
    { path: '/dashboard/wallet', label: 'Wallet', exact: false, icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>' },
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}