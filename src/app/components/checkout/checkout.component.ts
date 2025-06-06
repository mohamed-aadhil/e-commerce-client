import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SpecialOffersService } from '../../services/special-offers.service';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [CurrencyPipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="flex items-center mb-8">
          <button 
            (click)="goBack()"
            class="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cart
          </button>
        </div>

        <!-- Checkout Steps -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center">
            <div [class]="getStepClass(1)">1. Shipping</div>
            <div class="h-1 w-12 bg-gray-300 mx-2" [class.bg-blue-600]="currentStep >= 2"></div>
            <div [class]="getStepClass(2)">2. Payment</div>
            <div class="h-1 w-12 bg-gray-300 mx-2" [class.bg-blue-600]="currentStep >= 3"></div>
            <div [class]="getStepClass(3)">3. Review</div>
          </div>
        </div>

        <!-- Shipping Information (Step 1) -->
        <div *ngIf="currentStep === 1" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Shipping Information</h2>
          <form (ngSubmit)="nextStep()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                [(ngModel)]="shippingInfo.fullName"
                name="fullName"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input 
                type="text" 
                [(ngModel)]="shippingInfo.address"
                name="address"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input 
                  type="text" 
                  [(ngModel)]="shippingInfo.city"
                  name="city"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input 
                  type="text" 
                  [(ngModel)]="shippingInfo.postalCode"
                  name="postalCode"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
              </div>
            </div>
            <div class="flex justify-end">
              <button 
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>

        <!-- Payment Method Selection (Step 2) -->
        <div *ngIf="currentStep === 2" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Select Payment Method</h2>
          <div class="space-y-4">
            <div *ngFor="let method of paymentMethods" 
                 class="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                 [class.border-blue-500]="selectedPaymentMethod === method.id"
                 (click)="selectPaymentMethod(method.id)">
              <div class="flex items-center space-x-4">
                <img [src]="method.icon" [alt]="method.name" class="h-8 w-8">
                <div>
                  <h3 class="font-medium">{{ method.name }}</h3>
                  <p class="text-sm text-gray-600">{{ method.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-6">
            <button 
              (click)="previousStep()"
              class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button 
              (click)="nextStep()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              [disabled]="!selectedPaymentMethod"
            >
              Continue to Review
            </button>
          </div>
        </div>

        <!-- Order Review (Step 3) -->
        <div *ngIf="currentStep === 3" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Review Order</h2>
          
          <!-- Shipping Details -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">Shipping Address</h3>
            <div class="text-gray-600">
              <p>{{ shippingInfo.fullName }}</p>
              <p>{{ shippingInfo.address }}</p>
              <p>{{ shippingInfo.city }}, {{ shippingInfo.postalCode }}</p>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">Payment Method</h3>
            <div class="text-gray-600">
              {{ getSelectedPaymentMethodName() }}
            </div>
          </div>

          <!-- Order Summary -->
          <div class="border-t pt-4">
            <h3 class="font-medium mb-4">Order Summary</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{{ cartService.getSubtotal() | currency }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{{ 5.99 | currency }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{{ cartService.getSubtotal() * 0.1 | currency }}</span>
              </div>
              <div class="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{{ cartService.getFinalTotal() | currency }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between mt-6">
            <button 
              (click)="previousStep()"
              class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button 
              (click)="placeOrder()"
              class="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  currentStep: number = 1;
  shippingInfo = {
    fullName: '',
    address: '',
    city: '',
    postalCode: ''
  };
  
  paymentMethods: PaymentMethod[] = [
    {
      id: 'credit-card',
      name: 'Credit/Debit Card',
      icon: '/assets/images/credit-card.png',
      description: 'Pay securely with your credit or debit card'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '/assets/images/paypal.png',
      description: 'Fast and secure payment with PayPal'
    },
    {
      id: 'gpay',
      name: 'Google Pay',
      icon: '/assets/images/gpay.png',
      description: 'Quick payment with Google Pay'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '/assets/images/cod.png',
      description: 'Pay when you receive your order'
    }
  ];

  selectedPaymentMethod: string = '';

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if cart is empty
    this.cartService.getCart().subscribe(items => {
      if (items.length === 0) {
        this.router.navigate(['/']);
      }
    });
  }

  getStepClass(step: number): string {
    const baseClass = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium';
    if (this.currentStep === step) {
      return `${baseClass} bg-blue-600 text-white`;
    }
    if (this.currentStep > step) {
      return `${baseClass} bg-blue-600 text-white`;
    }
    return `${baseClass} bg-gray-300 text-gray-700`;
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }

  getSelectedPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    return method ? method.name : '';
  }

  placeOrder(): void {
    // Here you would typically integrate with a payment service
    // For now, we'll just show a success message and clear the cart
    alert('Order placed successfully! Thank you for your purchase.');
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
} 