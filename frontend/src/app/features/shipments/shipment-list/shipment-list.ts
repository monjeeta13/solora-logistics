// frontend/src/app/features/shipments/shipment-list/shipment-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShipmentService } from '../services/shipment';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">My Shipments</h1>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th class="px-6 py-4 font-medium">Tracking Info</th>
                <th class="px-6 py-4 font-medium">Origin → Destination</th>
                <th class="px-6 py-4 font-medium">Date & Courier</th>
                <th class="px-6 py-4 font-medium">Status</th>
                <th class="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-sm">
              
              <tr *ngIf="isLoading()">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500">Loading shipments...</td>
              </tr>

              <tr *ngFor="let shipment of shipments()" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-900">{{ shipment.awbNumber }}</p>
                  <p class="text-xs text-slate-500">{{ shipment.shipmentId }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-slate-900 font-medium">{{ shipment.senderDetails.city }}</p>
                  <p class="text-xs text-slate-400">to {{ shipment.recipientDetails.city }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-slate-900">{{ shipment.bookingDate | date:'mediumDate' }}</p>
                  <p class="text-xs text-slate-500">{{ shipment.courier.name }}</p>
                </td>
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
                <td class="px-6 py-4">
                  <a [routerLink]="['/dashboard/shipments', shipment.shipmentId]" class="text-primary hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                    Track <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ShipmentListComponent implements OnInit {
  private shipmentService = inject(ShipmentService);
  shipments = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.shipmentService.getShipments().subscribe({
      next: (res) => {
        this.shipments.set(res.shipments);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}