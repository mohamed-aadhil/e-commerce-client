import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { PaymentService, PaymentDetails } from '../../services/payment.service';
import { Observable, map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ShippingDetailsComponent, ShippingDetails } from '../shipping-details/shipping-details.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';

interface Offer {
  code: string;
  title: string;
  description: string;
  discount: number;
  type: 'percentage' | 'fixed' | 'bundle';
  minimumPurchase?: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ShippingDetailsComponent, PaymentFormComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <!-- Empty Cart Message -->
        <div *ngIf="cartItems.length === 0" class="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p class="text-gray-600 mb-8">Looks like you haven't added any books to your cart yet.</p>
          <a routerLink="/" class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Continue Shopping
          </a>
        </div>

        <!-- Cart Items -->
        <div *ngIf="cartItems.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Cart Items List -->
          <div class="md:col-span-2 space-y-4">
            <div *ngFor="let item of cartItems" class="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
              <img [src]="item.book.coverImage" [alt]="item.book.title" class="w-24 h-32 object-cover rounded">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900">{{item.book.title}}</h3>
                <p class="text-gray-600">{{item.book.author}}</p>
                <div class="flex items-center mt-2">
                  <button 
                    (click)="decreaseQuantity(item.book.id)"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <span class="mx-4">{{item.quantity}}</span>
                  <button 
                    (click)="increaseQuantity(item.book.id)"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div class="flex justify-between items-center mt-4">
                  <span class="text-lg font-bold text-blue-600">{{item.book.price * item.quantity | currency}}</span>
                  <button 
                    (click)="removeFromCart(item.book.id)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="md:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
              <div class="space-y-3">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{{cartService.getSubtotal() | currency}}</span>
                </div>
                <div *ngIf="cartService.getDiscount() > 0" class="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{{cartService.getDiscount() | currency}}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{{5.99 | currency}}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{{(cartService.getSubtotal() - cartService.getDiscount()) * 0.1 | currency}}</span>
                </div>
                <div class="border-t pt-3 mt-3">
                  <div class="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{{cartService.getFinalTotal() | currency}}</span>
                  </div>
                </div>
              </div>
              <button 
                (click)="onCheckout()"
                class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total$: Observable<number>;
  promoCode: string = '';
  appliedOffer: Offer | null = null;
  showShippingDetails: boolean = false;
  showPaymentForm: boolean = false;
  orderComplete: boolean = false;
  orderId: string = '';
  selectedShippingMethod: 'standard' | 'express' | 'overnight' = 'standard';
  shippingDetails: ShippingDetails | null = null;

  availableOffers: Offer[] = [
    {
      code: 'WEEKEND30',
      title: 'Weekend Special',
      description: 'Get 30% off on all fiction books',
      discount: 30,
      type: 'percentage'
    },
    {
      code: 'BUNDLE20',
      title: 'Bundle Deal',
      description: 'Get 20% off when you buy 3 or more books',
      discount: 20,
      type: 'percentage',
      minimumPurchase: 3
    },
    {
      code: 'FLAT10',
      title: 'Flat Discount',
      description: 'Get $10 off on orders above $50',
      discount: 10,
      type: 'fixed',
      minimumPurchase: 50
    }
  ];

  constructor(
    public cartService: CartService,
    private paymentService: PaymentService,
    private router: Router
  ) {
    this.total$ = this.cartService.getCart().pipe(
      map(items => items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0))
    );
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
    });
  }

  removeFromCart(bookId: number): void {
    this.cartService.removeFromCart(bookId);
  }

  increaseQuantity(bookId: number): void {
    this.cartService.increaseQuantity(bookId);
  }

  decreaseQuantity(bookId: number): void {
    this.cartService.decreaseQuantity(bookId);
  }

  onCheckout(): void {
    if (this.cartItems.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  applyOffer(offer: Offer): void {
    this.appliedOffer = offer;
    this.promoCode = offer.code;
  }

  applyPromoCode(): void {
    const offer = this.availableOffers.find(o => o.code === this.promoCode);
    if (offer) {
      this.appliedOffer = offer;
    } else {
      alert('Invalid promo code');
    }
  }

  getDiscountAmount(total: number): number {
    if (!this.appliedOffer) return 0;
    return this.appliedOffer.type === 'fixed' 
      ? this.appliedOffer.discount 
      : (total * this.appliedOffer.discount) / 100;
  }

  getTaxAmount(total: number): number {
    return total * 0.1; // 10% tax
  }

  getShippingCost(): number {
    return 5.99; // Fixed shipping cost
  }

  getFinalTotal(total: number): number {
    return total + this.getTaxAmount(total) + this.getShippingCost() - this.getDiscountAmount(total);
  }

  onShippingDetailsSubmitted(details: ShippingDetails): void {
    this.shippingDetails = details;
    this.selectedShippingMethod = details.shippingMethod;
    this.showShippingDetails = false;
    this.showPaymentForm = true;
  }

  onPaymentSubmitted(paymentDetails: PaymentDetails): void {
    if (!this.shippingDetails) return;

    this.total$.subscribe(total => {
      const finalAmount = this.getFinalTotal(total);
      
      this.paymentService.processPayment(
        paymentDetails,
        this.shippingDetails!,
        finalAmount
      ).subscribe(result => {
        this.orderId = result.orderId;
        this.orderComplete = true;
        this.showPaymentForm = false;
        this.cartService.clearCart();
      });
    });
  }
} 