// frontend/src/app/features/booking/booking-flow/booking-flow.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BookingService, CourierQuote } from '../services/booking.service';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-booking-flow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './booking-flow.component.html'
})
export class BookingFlowComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  // Wizard State: 1 = Details, 2 = Quotes, 3 = Confirmation, 4 = Success
  currentStep = signal<number>(1);

  bookingForm!: FormGroup;
  couriers = signal<CourierQuote[]>([]);
  selectedCourier = signal<CourierQuote | null>(null);

  walletBalance = signal<number>(0);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  bookingResult = signal<any>(null);

  ngOnInit() {
    this.initForm();
    this.fetchWalletBalance();
    this.setupPincodeAutofill('senderDetails');
    this.setupPincodeAutofill('recipientDetails');
  }

  private initForm() {
    const phoneRegex = /^[0-9]{10}$/;
    const pinRegex = /^[0-9]{6}$/;

    this.bookingForm = this.fb.group({
      senderDetails: this.fb.group({
        name: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(phoneRegex)]],
        address: ['', Validators.required],
        pinCode: ['', [Validators.required, Validators.pattern(pinRegex)]],
        city: [{ value: '', disabled: true }, Validators.required],
        state: [{ value: '', disabled: true }, Validators.required]
      }),
      recipientDetails: this.fb.group({
        name: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(phoneRegex)]],
        address: ['', Validators.required],
        pinCode: ['', [Validators.required, Validators.pattern(pinRegex)]],
        city: [{ value: '', disabled: true }, Validators.required],
        state: [{ value: '', disabled: true }, Validators.required]
      }),
      packageDetails: this.fb.group({
        weight: ['', [Validators.required, Validators.min(0.1)]],
        description: ['', Validators.required],
        productName: ['', Validators.required], // NEW
        productPrice: ['', [Validators.required, Validators.min(1)]]
      })
    });
  }

  private setupPincodeAutofill(groupName: 'senderDetails' | 'recipientDetails') {
    const group = this.bookingForm.get(groupName);
    if (!group) return;

    group.get('pinCode')?.valueChanges.pipe(
      filter(val => val && val.toString().length === 6),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(pin => this.bookingService.lookupPincode(pin).pipe(
        catchError(() => {
          this.errorMessage.set(`PIN Code ${pin} is not serviceable.`);
          group.patchValue({ city: '', state: '' });
          return of(null);
        })
      ))
    ).subscribe(details => {
      if (details) {
        this.errorMessage.set(null);
        group.patchValue({ city: details.district, state: details.state });
      }
    });
  }

  private fetchWalletBalance() {
    this.dashboardService.getSummary().subscribe(data => {
      this.walletBalance.set(data.walletBalance);
    });
  }

  copySenderToRecipient() {
    const sender = this.bookingForm.get('senderDetails')?.getRawValue();
    this.bookingForm.get('recipientDetails')?.patchValue(sender);
  }

  async onStep1Submit() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.bookingService.getQuotes().subscribe({
      next: (res) => {
        this.couriers.set(res.couriers);
        this.currentStep.set(2);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to fetch courier quotes.');
        this.isLoading.set(false);
      }
    });
  }

  selectCourier(courier: CourierQuote) {
    if (this.walletBalance() < courier.price) {
      this.errorMessage.set(`Insufficient wallet balance. You need ₹${courier.price} but have ₹${this.walletBalance()}.`);
      return;
    }
    this.errorMessage.set(null);
    this.selectedCourier.set(courier);
    this.currentStep.set(3);
  }

  confirmBooking() {
    if (!this.selectedCourier() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // We use getRawValue to include disabled fields (city, state)
    const payload = {
      ...this.bookingForm.getRawValue(),
      courierId: this.selectedCourier()?.id
    };

    this.bookingService.bookShipment(payload).subscribe({
      next: (res) => {
        this.bookingResult.set(res.shipment);
        this.walletBalance.set(res.remainingBalance);
        this.currentStep.set(4);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Failed to book shipment.');
        this.isLoading.set(false);
      }
    });
  }

  goToStep(step: number) {
    this.errorMessage.set(null);
    this.currentStep.set(step);
  }
}