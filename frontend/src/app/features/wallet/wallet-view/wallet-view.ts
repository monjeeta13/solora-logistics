// frontend/src/app/features/wallet/wallet-view/wallet-view.component.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from '../services/wallet';
import { AuthService } from '../../../core/services/auth.service';

// Declare Razorpay globally so TypeScript doesn't throw errors
declare var Razorpay: any;

@Component({
  selector: 'app-wallet-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6 pb-12">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900">Wallet</h1>
        <div class="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-sm font-medium text-indigo-900">Secured Environment</span>
        </div>
      </div>

      <!-- Top Row: Balances & Recharge -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg text-white">
          <p class="text-slate-400 text-sm font-medium mb-1">Available Balance</p>
          <p class="text-4xl font-black mb-4">₹{{ currentBalance() }}</p>
          <div class="flex items-center text-xs font-medium text-slate-300 gap-2">
            <span class="w-2 h-2 rounded-full bg-green-400"></span> Valid for shipments
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p class="text-slate-500 text-sm font-medium mb-1">Total Amount Spent</p>
          <p class="text-3xl font-bold text-slate-900">₹{{ totalSpent() }}</p>
          <p class="text-xs text-slate-400 mt-2">Aggregated across all bookings</p>
        </div>

        <!-- Razorpay Recharge Panel -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Quick Recharge
          </h3>
          
          <div class="grid grid-cols-3 gap-3 mb-4">
            <button *ngFor="let amount of [500, 1000, 2000]" 
                    (click)="initiateRecharge(amount)"
                    [disabled]="isProcessingRecharge()"
                    class="border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
              ₹{{ amount }}
            </button>
          </div>
          
          <div *ngIf="rechargeMessage()" class="text-sm px-3 py-2 rounded" 
               [ngClass]="rechargeMessage()?.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
            {{ rechargeMessage() }}
          </div>
        </div>
      </div>

      <!-- Transaction Ledger -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-bold text-slate-900">Transaction History</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th class="px-6 py-3 font-medium">Date</th>
                <th class="px-6 py-3 font-medium">Transaction Details</th>
                <th class="px-6 py-3 font-medium text-right">Amount</th>
                <th class="px-6 py-3 font-medium text-right">Balance After</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-sm">
              
              <tr *ngIf="isLoading()">
                <td colspan="4" class="px-6 py-8 text-center text-slate-500">Loading ledger...</td>
              </tr>

              <tr *ngFor="let txn of transactions()" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-slate-900 font-medium">{{ txn.createdAt | date:'mediumDate' }}</p>
                  <p class="text-xs text-slate-500">{{ txn.createdAt | date:'shortTime' }}</p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                         [ngClass]="txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                      <svg *ngIf="txn.type === 'credit'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      <svg *ngIf="txn.type === 'debit'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                    </div>
                    <div>
                      <p class="font-medium text-slate-900">{{ txn.description }}</p>
                      <p class="text-xs text-slate-400 font-mono mt-0.5">{{ txn.transactionId }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="font-bold" [ngClass]="txn.type === 'credit' ? 'text-green-600' : 'text-slate-900'">
                    {{ txn.type === 'credit' ? '+' : '-' }}₹{{ txn.amount }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-600">
                  ₹{{ txn.balanceAfter }}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  `
})
export class WalletViewComponent implements OnInit {
  private walletService = inject(WalletService);
  private authService = inject(AuthService); // Used to pull user name/email for Razorpay
  
  transactions = signal<any[]>([]);
  currentBalance = signal<number>(0);
  isLoading = signal(true);

  isProcessingRecharge = signal(false);
  rechargeMessage = signal<string | null>(null);
  
  // Keep track of the active user for the checkout prefill
  currentUser: any = null;

  totalSpent = computed(() => {
    return this.transactions()
      .filter(txn => txn.type === 'debit')
      .reduce((sum, txn) => sum + txn.amount, 0);
  });

  ngOnInit() {
    this.fetchLedger();
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  fetchLedger() {
    this.isLoading.set(true);
    this.walletService.getTransactions().subscribe({
      next: (res) => {
        this.transactions.set(res.transactions);
        this.currentBalance.set(res.currentBalance);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load wallet data', err);
        this.isLoading.set(false);
      }
    });
  }

  initiateRecharge(amount: number) {
    this.isProcessingRecharge.set(true);
    this.rechargeMessage.set('Initializing checkout...');

    // 1. Ask backend to create Razorpay Order
    this.walletService.createRechargeOrder(amount).subscribe({
      next: (res) => {
        const order = res.order;
        this.openRazorpayCheckout(order, amount);
      },
      error: (err) => {
        console.error(err);
        this.rechargeMessage.set('Failed to initialize recharge.');
        this.isProcessingRecharge.set(false);
      }
    });
  }

  private openRazorpayCheckout(order: any, amount: number) {
    const options = {
      key: 'rzp_test_Txfmv6tojKiPUk', 
      amount: order.amount,
      currency: order.currency,
      name: 'Solora Logistics',
      description: 'Wallet Recharge',
      order_id: order.id,
      prefill: {
        name: this.currentUser?.displayName || 'Demo User',
        email: this.currentUser?.email || 'demo@example.com'
      },
      theme: {
        color: '#4f46e5' // Match your primary tailwind color
      },
      handler: (response: any) => {
        // 2. Capture Success and Send to Backend for Signature Verification
        this.rechargeMessage.set('Verifying payment securely...');
        const verificationPayload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          amount: amount // Pass amount so backend knows how much to credit
        };

        this.walletService.verifyRecharge(verificationPayload).subscribe({
          next: () => {
            this.rechargeMessage.set(`Successfully recharged ₹${amount}!`);
            this.fetchLedger(); // Refresh table and balances
            this.isProcessingRecharge.set(false);
          },
          error: () => {
            this.rechargeMessage.set('Payment verification failed.');
            this.isProcessingRecharge.set(false);
          }
        });
      },
      modal: {
        ondismiss: () => {
          this.rechargeMessage.set('Recharge cancelled.');
          this.isProcessingRecharge.set(false);
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}