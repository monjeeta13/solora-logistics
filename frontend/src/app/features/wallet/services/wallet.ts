// frontend/src/app/features/wallet/services/wallet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WalletResponse {
  currentBalance: number;
  transactions: any[];
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private http = inject(HttpClient);

  getTransactions(): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${environment.apiUrl}/dashboard/wallet/transactions`);
  }

  // NEW: Recharge APIs
  createRechargeOrder(amount: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/wallet/create-order`, { amount });
  }

  verifyRecharge(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/wallet/verify-payment`, payload);
  }
}