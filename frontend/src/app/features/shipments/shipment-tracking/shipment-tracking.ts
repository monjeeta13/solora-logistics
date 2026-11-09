// frontend/src/app/features/shipments/shipment-tracking/shipment-tracking.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { ShipmentService } from '../services/shipment';
import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-shipment-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule],
  template: `
    <div *ngIf="shipment() as data" class="max-w-5xl mx-auto space-y-6 pb-12">
      
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/dashboard/shipments" class="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-wider">{{ data.awbNumber }}</h1>
          <p class="text-sm text-slate-500">Shipped via {{ data.courier.name }}</p>
          
          <div class="mt-4 flex flex-wrap items-center gap-3">
            
            <span *ngIf="data.currentStatus === 'Cancelled'" class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Cancelled
            </span>
            
            <button (click)="downloadLabel()" class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Label
            </button>

            <button *ngIf="data.currentStatus !== 'Cancelled' && data.currentStatus !== 'Delivered'" 
                    (click)="cancelShipment()" 
                    [disabled]="isCancelling()"
                    class="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ isCancelling() ? 'Cancelling...' : 'Cancel Shipment' }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Map & Details -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Google Map Integration -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
            <google-map height="100%" width="100%" [center]="mapCenter" [zoom]="mapZoom" [options]="{streetViewControl: false, mapTypeControl: false}">
              <!-- Origin Marker -->
              <map-marker [position]="pathVertices[0]" [options]="{title: 'Origin', label: 'A'}"></map-marker>
              <!-- Destination Marker -->
              <map-marker [position]="pathVertices[1]" [options]="{title: 'Destination', label: 'B'}"></map-marker>
              <!-- Connecting Polyline -->
              <map-polyline [path]="pathVertices" [options]="polylineOptions"></map-polyline>
            </google-map>
          </div>

          <!-- Eco Route Breadcrumbs -->
          <div *ngIf="data.courier.serviceType === 'eco' && data.waypoints?.length > 0" 
              class="bg-green-50 p-4 rounded-xl border border-green-200 mt-6 shadow-sm">
            <h4 class="text-green-800 font-bold flex items-center gap-2 mb-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Sustainable Hub-and-Spoke Routing Active
            </h4>
            <div class="flex items-center text-sm font-bold text-green-700 flex-wrap gap-2">
              <span class="bg-white px-2 py-1 rounded border border-green-200">{{ data.senderDetails.city }}</span>
              
              <ng-container *ngFor="let wp of data.waypoints">
                <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                <span class="bg-green-100 px-2 py-1 rounded border border-green-300">{{ wp.city }}</span>
              </ng-container>
              
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              <span class="bg-white px-2 py-1 rounded border border-green-200">{{ data.recipientDetails.city }}</span>
            </div>
            <p class="text-xs text-green-600 mt-3 font-medium">
              This route consolidates shipments at major transit centers to minimize empty miles and reduce overall carbon emissions.
            </p>
          </div>

          <!-- Addresses -->
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Origin</h4>
              <p class="font-medium text-slate-900">{{ data.senderDetails.name }}</p>
              <p class="text-slate-600 text-sm mt-1">{{ data.senderDetails.address }}</p>
              <p class="text-slate-600 text-sm">{{ data.senderDetails.city }}, {{ data.senderDetails.state }} - {{ data.senderDetails.pinCode }}</p>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Destination</h4>
              <p class="font-medium text-slate-900">{{ data.recipientDetails.name }}</p>
              <p class="text-slate-600 text-sm mt-1">{{ data.recipientDetails.address }}</p>
              <p class="text-slate-600 text-sm">{{ data.recipientDetails.city }}, {{ data.recipientDetails.state }} - {{ data.recipientDetails.pinCode }}</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Tracking Timeline -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Tracking Status</h3>
          
          <div class="relative border-l-2 border-slate-100 ml-3 space-y-8">
            <div *ngFor="let event of data.trackingEvents; let first = first" class="relative pl-6">
              
              <!-- Timeline Node -->
              <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white"
                   [ngClass]="first ? 'border-primary' : 'border-slate-300'"></div>
              
              <div [ngClass]="first ? 'opacity-100' : 'opacity-60'">
                <p class="font-bold text-sm" [ngClass]="first ? 'text-primary' : 'text-slate-700'">{{ event.status }}</p>
                <p class="text-xs text-slate-500 mt-1 mb-2">{{ event.date | date:'medium' }}</p>
                <p class="text-sm text-slate-600">{{ event.description }}</p>
                <p *ngIf="event.location" class="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {{ event.location }}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ShipmentTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shipmentService = inject(ShipmentService);

  shipment = signal<any>(null);
  isLoading = signal(true);
  isCancelling = signal(false);

  // Google Maps Config
  mapCenter: google.maps.LatLngLiteral = { lat: 20.5937, lng: 78.9629 }; // India default
  mapZoom = 5;
  pathVertices: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#4f46e5', // Primary Indigo
    strokeOpacity: 0.8,
    strokeWeight: 4,
    geodesic: true // Creates a beautiful curved line over long distances
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shipmentService.getShipmentDetails(id).subscribe({
        next: (res) => {
          this.shipment.set(res.shipment);
          this.setupMap(res.shipment);
          this.isLoading.set(false);
        },
        error: (err) => console.error(err)
      });
    }
  }

  private setupMap(data: any) {
    if (data.senderDetails.coordinates && data.recipientDetails.coordinates) {

      // Start with origin
      this.pathVertices = [
        { lat: data.senderDetails.coordinates.lat, lng: data.senderDetails.coordinates.lng }
      ];

      // Add intermediate waypoints if they exist (Eco Routing)
      if (data.waypoints && data.waypoints.length > 0) {
        data.waypoints.forEach((wp: any) => {
          this.pathVertices.push({ lat: wp.lat, lng: wp.lng });
        });
      }

      // End with destination
      this.pathVertices.push({ lat: data.recipientDetails.coordinates.lat, lng: data.recipientDetails.coordinates.lng });

      // Center map on the first waypoint if Eco, otherwise midpoint
      if (data.waypoints && data.waypoints.length > 0) {
        this.mapCenter = { lat: data.waypoints[0].lat, lng: data.waypoints[0].lng };
        this.mapZoom = 5; // Zoom out slightly to see the whole route
      } else {
        this.mapCenter = {
          lat: (data.senderDetails.coordinates.lat + data.recipientDetails.coordinates.lat) / 2,
          lng: (data.senderDetails.coordinates.lng + data.recipientDetails.coordinates.lng) / 2
        };
        this.mapZoom = 6;
      }
    }
  }

  cancelShipment() {
    if (confirm('Are you sure you want to cancel this shipment? The booking amount will be refunded to your wallet.')) {
      this.isCancelling.set(true);
      const data = this.shipment();
      this.shipmentService.cancelShipment(data.shipmentId).subscribe({
        next: () => {
          // Refresh tracking details
          this.shipmentService.getShipmentDetails(data.shipmentId).subscribe(res => {
            this.shipment.set(res.shipment);
            this.isCancelling.set(false);
          });
        },
        error: (err) => {
          alert(err.error?.error || 'Failed to cancel shipment');
          this.isCancelling.set(false);
        }
      });
    }
  }

  downloadLabel() {
      const data = this.shipment();
      if (!data) return;

      const doc = new jsPDF({ format: 'a6', unit: 'mm' }); 
      
      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SOLORA LOGISTICS', 52.5, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('PREPAID', 52.5, 20, { align: 'center' });

      // Barcode
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, data.awbNumber, { format: 'CODE128', displayValue: false, margin: 0 });
      const barcodeImg = canvas.toDataURL('image/png');
      doc.addImage(barcodeImg, 'PNG', 12.5, 25, 80, 20);

      // AWB Number
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`AWB: ${data.awbNumber}`, 52.5, 52, { align: 'center' });

      doc.line(10, 58, 95, 58);

      // 1. Seller Information
      doc.setFontSize(10);
      doc.text('Seller: ', 10, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(data.senderDetails.name, 23, 65);
      
      const senderFullAddress = `${data.senderDetails.address}, ${data.senderDetails.city}, ${data.senderDetails.state} - ${data.senderDetails.pinCode}`;
      const senderSplitAddress = doc.splitTextToSize(senderFullAddress, 85);
      doc.text(senderSplitAddress, 10, 70);

      let yPos = 70 + (senderSplitAddress.length * 5) + 3;
      doc.line(10, yPos, 95, yPos);
      yPos += 6;

      // 2. Customer Information
      doc.setFont('helvetica', 'bold');
      doc.text('Customer: ', 10, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(data.recipientDetails.name, 28, yPos);
      
      yPos += 5;
      const recipientFullAddress = `${data.recipientDetails.address}, ${data.recipientDetails.city}, ${data.recipientDetails.state} - ${data.recipientDetails.pinCode}`;
      const recipientSplitAddress = doc.splitTextToSize(recipientFullAddress, 85);
      doc.text(recipientSplitAddress, 10, yPos);

      yPos += (recipientSplitAddress.length * 5) + 3;
      doc.line(10, yPos, 95, yPos);
      yPos += 6;

      // 3. Product Information
      doc.setFont('helvetica', 'bold');
      doc.text('Product Name:', 10, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(data.packageDetails.productName || 'General Goods', 40, yPos); 
      yPos += 6;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Declared Value:', 10, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`Rs. ${data.packageDetails.productPrice || 0}`, 40, yPos);
      yPos += 5;

      doc.line(10, yPos, 95, yPos);
      yPos += 6;

      // 4. Declaration Footer
      doc.setFontSize(8);
      doc.text('Declaration: Contents of this package are being purchased for', 10, yPos);
      doc.text('personal purpose and not for resale.', 10, yPos + 4);

      doc.save(`Solora_Label_${data.awbNumber}.pdf`);
    }
}