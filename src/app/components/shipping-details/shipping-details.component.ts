import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'overnight';
}

@Component({
  selector: 'app-shipping-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Shipping Details</h2>
      
      <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Personal Information -->
        <div class="space-y-4">
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="fullName"
              formControlName="fullName"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('fullName')}"
            >
            <p *ngIf="isFieldInvalid('fullName')" class="mt-1 text-sm text-red-600">
              Full name is required
            </p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('email')}"
            >
            <p *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
              Valid email is required
            </p>
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('phone')}"
            >
            <p *ngIf="isFieldInvalid('phone')" class="mt-1 text-sm text-red-600">
              Valid phone number is required
            </p>
          </div>
        </div>

        <!-- Address Information -->
        <div class="space-y-4">
          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              formControlName="address"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('address')}"
            >
            <p *ngIf="isFieldInvalid('address')" class="mt-1 text-sm text-red-600">
              Address is required
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                id="city"
                formControlName="city"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('city')}"
              >
              <p *ngIf="isFieldInvalid('city')" class="mt-1 text-sm text-red-600">
                City is required
              </p>
            </div>

            <div>
              <label for="state" class="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                id="state"
                formControlName="state"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('state')}"
              >
              <p *ngIf="isFieldInvalid('state')" class="mt-1 text-sm text-red-600">
                State is required
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="zipCode" class="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                formControlName="zipCode"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('zipCode')}"
              >
              <p *ngIf="isFieldInvalid('zipCode')" class="mt-1 text-sm text-red-600">
                ZIP code is required
              </p>
            </div>

            <div>
              <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
              <select
                id="country"
                formControlName="country"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('country')}"
              >
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
              <p *ngIf="isFieldInvalid('country')" class="mt-1 text-sm text-red-600">
                Country is required
              </p>
            </div>
          </div>
        </div>

        <!-- Shipping Method -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Shipping Method</label>
          <div class="space-y-2">
            <div class="flex items-center">
              <input
                type="radio"
                id="standard"
                value="standard"
                formControlName="shippingMethod"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              >
              <label for="standard" class="ml-3">
                <span class="block text-sm font-medium text-gray-900">Standard Shipping</span>
                <span class="block text-sm text-gray-500">4-5 business days - Free</span>
              </label>
            </div>
            <div class="flex items-center">
              <input
                type="radio"
                id="express"
                value="express"
                formControlName="shippingMethod"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              >
              <label for="express" class="ml-3">
                <span class="block text-sm font-medium text-gray-900">Express Shipping</span>
                <span class="block text-sm text-gray-500">2-3 business days - $9.99</span>
              </label>
            </div>
            <div class="flex items-center">
              <input
                type="radio"
                id="overnight"
                value="overnight"
                formControlName="shippingMethod"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              >
              <label for="overnight" class="ml-3">
                <span class="block text-sm font-medium text-gray-900">Overnight Shipping</span>
                <span class="block text-sm text-gray-500">Next business day - $19.99</span>
              </label>
            </div>
          </div>
          <p *ngIf="isFieldInvalid('shippingMethod')" class="mt-1 text-sm text-red-600">
            Please select a shipping method
          </p>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          [disabled]="shippingForm.invalid"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  `
})
export class ShippingDetailsComponent {
  @Output() shippingDetailsSubmitted = new EventEmitter<ShippingDetails>();
  shippingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.shippingForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]],
      country: ['', Validators.required],
      shippingMethod: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shippingForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.shippingForm.valid) {
      this.shippingDetailsSubmitted.emit(this.shippingForm.value);
    } else {
      Object.keys(this.shippingForm.controls).forEach(key => {
        const control = this.shippingForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }
} 