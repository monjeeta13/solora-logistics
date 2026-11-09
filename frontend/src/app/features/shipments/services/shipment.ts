// frontend/src/app/features/shipments/services/shipment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private http = inject(HttpClient);

  getShipments(): Observable<{ shipments: any[] }> {
    return this.http.get<{ shipments: any[] }>(`${environment.apiUrl}/shipments`);
  }

  getShipmentDetails(id: string): Observable<{ shipment: any }> {
    return this.http.get<{ shipment: any }>(`${environment.apiUrl}/shipments/${id}`);
  }
}