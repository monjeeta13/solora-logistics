// frontend/src/app/features/booking/services/booking.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CourierQuote {
  id: string;
  name: string;
  price: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  description: string;
}

export interface PincodeDetails {
  district: string;
  state: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);

  lookupPincode(pincode: string): Observable<PincodeDetails> {
    return this.http.get<PincodeDetails>(`${environment.apiUrl}/pincodes/${pincode}`);
  }

  getQuotes(): Observable<{ couriers: CourierQuote[] }> {
    return this.http.get<{ couriers: CourierQuote[] }>(`${environment.apiUrl}/shipments/quote`);
  }

  bookShipment(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/shipments/book`, payload);
  }
}