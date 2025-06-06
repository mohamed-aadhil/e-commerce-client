import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentDetails } from '../../services/payment.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Payment Details</h2>
      
      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Card Number -->
        <div>
          <label for="cardNumber" class="block text-sm font-medium text-gray-700">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            formControlName="cardNumber"
            placeholder="1234 5678 9012 3456"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            [ngClass]="{'border-red-500': isFieldInvalid('cardNumber')}"
          >
          <p *ngIf="isFieldInvalid('cardNumber')" class="mt-1 text-sm text-red-600">
            Please enter a valid card number
          </p>
        </div>

        <!-- Card Holder -->
        <div>
          <label for="cardHolder" class="block text-sm font-medium text-gray-700">Card Holder Name</label>
          <input
            type="text"
            id="cardHolder"
            formControlName="cardHolder"
            placeholder="John Doe"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            [ngClass]="{'border-red-500': isFieldInvalid('cardHolder')}"
          >
          <p *ngIf="isFieldInvalid('cardHolder')" class="mt-1 text-sm text-red-600">
            Please enter the card holder name
          </p>
        </div>

        <!-- Expiry Date and CVV -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="expiryDate" class="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="text"
              id="expiryDate"
              formControlName="expiryDate"
              placeholder="MM/YY"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('expiryDate')}"
            >
            <p *ngIf="isFieldInvalid('expiryDate')" class="mt-1 text-sm text-red-600">
              Please enter a valid expiry date
            </p>
          </div>

          <div>
            <label for="cvv" class="block text-sm font-medium text-gray-700">CVV</label>
            <input
              type="password"
              id="cvv"
              formControlName="cvv"
              placeholder="123"
              maxlength="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('cvv')}"
            >
            <p *ngIf="isFieldInvalid('cvv')" class="mt-1 text-sm text-red-600">
              Please enter a valid CVV
            </p>
          </div>
        </div>

        <!-- Payment Icons -->
        <div class="flex justify-center space-x-4 my-6">
          <img src="assets/images/visa.png" alt="Visa" class="h-8">
          <img src="assets/images/mastercard.png" alt="Mastercard" class="h-8">
          <img src="assets/images/amex.png" alt="American Express" class="h-8">
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          [disabled]="paymentForm.invalid || isProcessing"
        >
          <span *ngIf="!isProcessing">Complete Payment</span>
          <span *ngIf="isProcessing" class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        </button>
      </form>

      <!-- Secure Payment Notice -->
      <div class="mt-6 text-center text-sm text-gray-500">
        <div class="flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
          Secure Payment
        </div>
        <p>Your payment information is encrypted and secure.</p>
      </div>
    </div>
  `
})
export class PaymentFormComponent {
  @Output() paymentSubmitted = new EventEmitter<PaymentDetails>();
  paymentForm: FormGroup;
  isProcessing: boolean = false;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{16}$')
      ]],
      cardHolder: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      expiryDate: ['', [
        Validators.required,
        Validators.pattern('^(0[1-9]|1[0-2])\/?([0-9]{2})$')
      ]],
      cvv: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{3,4}$')
      ]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isProcessing = true;
      // Format card number to remove spaces
      const formValue = this.paymentForm.value;
      formValue.cardNumber = formValue.cardNumber.replace(/\s/g, '');
      
      this.paymentSubmitted.emit(formValue);
    } else {
      Object.keys(this.paymentForm.controls).forEach(key => {
        const control = this.paymentForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }
} 