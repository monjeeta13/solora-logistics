// frontend/src/app/features/dashboard/dashboard-summary/dashboard-summary.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardSummary } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <a routerLink="/dashboard/book" class="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Book Shipment
        </a>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let i of [1,2,3,4]" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
          <div class="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div class="h-8 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div *ngIf="!isLoading() && summary()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">Wallet Balance</p>
            <p class="text-3xl font-bold text-slate-900">₹{{ summary()?.walletBalance }}</p>
          </div>
          <div class="p-3 bg-indigo-50 rounded-lg text-primary">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">Total Bookings</p>
            <p class="text-3xl font-bold text-slate-900">{{ summary()?.totalShipments }}</p>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg text-blue-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
            <p class="text-3xl font-bold text-slate-900">₹{{ summary()?.totalSpent }}</p>
          </div>
          <div class="p-3 bg-orange-50 rounded-lg text-orange-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 mb-1">Delivered</p>
            <p class="text-3xl font-bold text-slate-900">{{ summary()?.deliveredCount }}</p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg text-green-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

      </div>

      <!-- Recent Shipments Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 class="text-lg font-bold text-slate-900">Recent Shipments</h2>
          <a routerLink="/dashboard/shipments" class="text-sm text-primary hover:text-indigo-700 font-medium">View All →</a>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th class="px-6 py-3 font-medium">AWB Number</th>
                <th class="px-6 py-3 font-medium">Destination</th>
                <th class="px-6 py-3 font-medium">Courier</th>
                <th class="px-6 py-3 font-medium">Date</th>
                <th class="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-sm">
              
              <tr *ngIf="summary()?.recentShipments?.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  <p>No shipments booked yet.</p>
                  <button routerLink="/dashboard/book" class="mt-4 text-primary font-medium hover:underline">Book your first shipment</button>
                </td>
              </tr>

              <tr *ngFor="let shipment of summary()?.recentShipments" class="hover:bg-slate-50 transition-colors cursor-pointer" [routerLink]="['/dashboard/shipments', shipment.shipmentId]">
                <td class="px-6 py-4 font-medium text-slate-900">{{ shipment.awbNumber }}</td>
                <td class="px-6 py-4 text-slate-600">
                  {{ shipment.recipientDetails.city }}, {{ shipment.recipientDetails.state }}
                </td>
                <td class="px-6 py-4 text-slate-600">{{ shipment.courier.name }}</td>
                <td class="px-6 py-4 text-slate-600">{{ shipment.bookingDate | date:'mediumDate' }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': shipment.currentStatus === 'Delivered',
                          'bg-blue-100 text-blue-800': shipment.currentStatus === 'In Transit' || shipment.currentStatus === 'Out for Delivery',
                          'bg-orange-100 text-orange-800': shipment.currentStatus === 'Shipment Booked' || shipment.currentStatus === 'Pickup Scheduled' || shipment.currentStatus === 'Picked Up'
                        }">
                    {{ shipment.currentStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardSummaryComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  summary = signal<DashboardSummary | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard:', err);
        this.error.set('Could not load dashboard data.');
        this.isLoading.set(false);
      }
    });
  }
}