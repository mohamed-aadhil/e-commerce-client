import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { Book } from '../../models/book.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      <!-- Empty Wishlist State -->
      <div *ngIf="wishlist.length === 0" class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
        <p class="text-gray-600 mb-8">Browse our collection and add items to your wishlist!</p>
        <a routerLink="/books" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Browse Books
        </a>
      </div>

      <!-- Wishlist Items -->
      <div *ngIf="wishlist.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let book of wishlist" class="bg-white rounded-lg shadow-md overflow-hidden">
          <img [src]="book.coverImage" [alt]="book.title" class="w-full h-64 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ book.title }}</h3>
            <p class="text-gray-600 mb-2">{{ book.author }}</p>
            <div class="flex justify-between items-center mb-4">
              <span class="text-2xl font-bold text-blue-600">$ {{ book.price }}</span>
              <button 
                (click)="removeFromWishlist(book)"
                class="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <button 
              (click)="addToCart(book)"
              class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  wishlist: Book[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.wishlistService.wishlist$.subscribe(items => {
      this.wishlist = items;
    });
  }

  removeFromWishlist(book: Book): void {
    this.wishlistService.removeFromWishlist({ ...book });
  }

  addToCart(book: Book): void {
    this.cartService.addToCart({ ...book });
    this.wishlistService.removeFromWishlist(book);
  }
} 