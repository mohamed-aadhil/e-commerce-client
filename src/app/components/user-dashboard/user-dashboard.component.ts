import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookComponent } from '../book/book.component';
import { Book } from '../../models/book.model';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { CartService, CartItem } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { HeaderSliderComponent } from '../header-slider/header-slider.component';

interface Author {
  id: number;
  name: string;
  imageUrl: string;
  bio: string;
  bookCount: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BookComponent, FooterComponent, FormsModule, HeaderSliderComponent],
  template: `
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <!-- Top Bar -->
        <div class="py-2 border-b">
          <div class="flex justify-between items-center">
            <!-- Left Side -->
            <div class="flex items-center space-x-4">
              <a routerLink="/" class="text-2xl font-bold text-blue-600">BookHaven</a>
            </div>

            <!-- Right Side -->
            <div class="flex items-center space-x-6">
              <!-- Search Bar -->
              <div class="flex items-center">
                <div class="relative">
                  <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    placeholder="Search by title, author, ISBN..." 
                    class="w-96 px-4 py-2 border rounded-l-lg focus:outline-none focus:border-blue-500"
                  >
                  <select 
                    [(ngModel)]="searchCategory"
                    class="absolute right-0 top-0 h-full px-3 py-2 border-l bg-gray-50 rounded-r-lg focus:outline-none"
                  >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="isbn">ISBN</option>
                  </select>
                </div>
                <button 
                  (click)="onSearch()"
                  class="ml-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              <!-- Wishlist -->
              <a 
                *ngIf="isLoggedIn"
                routerLink="/wishlist" 
                class="flex items-center text-gray-700 hover:text-blue-600 relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span class="ml-1">Wishlist</span>
                <span 
                  *ngIf="wishlistCount > 0"
                  class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {{wishlistCount}}
                </span>
              </a>

              <!-- Cart -->
              <div class="relative group">
                <button class="flex items-center text-gray-700 hover:text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class="ml-1">Cart</span>
                  <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{cartItemCount}}
                  </span>
                </button>
                <!-- Cart Dropdown -->
                <div class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2">Shopping Cart</h3>
                    <div *ngIf="cartItems.length === 0" class="text-gray-500 text-center py-4">
                      Your cart is empty
                    </div>
                    <div *ngFor="let item of cartItems" class="flex items-center gap-2 py-2 border-b last:border-0">
                      <img [src]="item.book.coverImage" [alt]="item.book.title" class="w-12 h-16 object-cover rounded">
                      <div class="flex-1">
                        <h4 class="text-sm font-medium">{{item.book.title}}</h4>
                        <p class="text-gray-500 text-xs">{{item.book.price | currency}}</p>
                        <p class="text-gray-500 text-xs">Qty: {{item.quantity}}</p>
                      </div>
                      <button (click)="removeFromCart(item.book.id)" class="text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div *ngIf="cartItems.length > 0" class="mt-4">
                      <div class="flex justify-between font-semibold mb-4">
                        <span>Total:</span>
                        <span>{{cartTotal | currency}}</span>
                      </div>
                      <button 
                        (click)="onCheckout()"
                        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Menu -->
              <div class="relative group">
                <button class="flex items-center text-gray-700 hover:text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="ml-1">{{ isLoggedIn ? 'Account' : 'Sign In' }}</span>
                </button>
                <!-- Account Dropdown -->
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div class="py-2">
                    <ng-container *ngIf="!isLoggedIn">
                      <a routerLink="/login" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <div class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Login
                        </div>
                      </a>
                      <a routerLink="/register" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <div class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Register
                        </div>
                      </a>
                    </ng-container>
                    <ng-container *ngIf="isLoggedIn">
                      <a routerLink="/wishlist" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <div class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          My Wishlist
                        </div>
                      </a>
                      <button (click)="logout()" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
                        <div class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </div>
                      </button>
                    </ng-container>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Slider -->
    <app-header-slider></app-header-slider>

    <!-- Featured Books -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Featured Books</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-book *ngFor="let book of featuredBooks" [book]="book"></app-book>
        </div>
      </div>
    </section>

    <!-- Featured Authors -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Featured Authors</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            *ngFor="let author of featuredAuthors" 
            class="group cursor-pointer"
            [routerLink]="['/author', author.id]"
          >
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div class="relative">
                <img 
                  [src]="author.imageUrl" 
                  [alt]="author.name"
                  class="w-full h-72 object-cover"
                >
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 class="text-xl font-bold text-white">{{ author.name }}</h3>
                </div>
              </div>
              <div class="p-6">
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ author.bio }}</p>
                <div class="flex items-center text-gray-500 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{{ author.bookCount }} Published Books</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Shop by Categories -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Shop by Categories</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <a 
            *ngFor="let category of categories"
            [routerLink]="['/category', category.route]"
            class="group"
          >
            <div 
              class="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer"
              [ngStyle]="{'border-color': category.color}"
              style="border-width: 2px;"
            >
              <div 
                class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                [ngStyle]="{'background-color': category.color + '20'}"
              >
                <i [class]="category.icon" [ngStyle]="{'color': category.color}"></i>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">{{ category.name }}</h3>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <app-footer></app-footer>
  `
})
export class UserDashboardComponent implements OnInit {
  // Header properties
  searchQuery: string = '';
  searchCategory: string = 'title';
  cartItemCount: number = 0;
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  isLoggedIn: boolean = false;
  wishlistCount: number = 0;

  featuredBooks: Book[] = [
    {
      id: 1,
      title: 'The Midnight Library',
      author: 'Matt Haig',
      price: 24.99,
      category: 'Fiction',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg',
      description: 'A novel about all the choices that go into a life well lived',
      publishedDate: '2020-08-13',
      rating: 4.5,
      stock: 15
    },
    {
      id: 2,
      title: 'Atomic Habits',
      author: 'James Clear',
      price: 27.99,
      category: 'Business',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',
      description: 'Tiny Changes, Remarkable Results',
      publishedDate: '2018-10-16',
      rating: 4.8,
      stock: 25
    },
    {
      id: 3,
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      price: 23.99,
      category: 'Mystery & Thriller',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1668782119i/40097951.jpg',
      description: 'A shocking psychological thriller',
      publishedDate: '2019-02-05',
      rating: 4.4,
      stock: 20
    },
    {
      id: 4,
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      price: 29.99,
      category: 'Biography',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288482i/11084145.jpg',
      description: 'The exclusive biography of Steve Jobs',
      publishedDate: '2011-10-24',
      rating: 4.6,
      stock: 18
    }
  ];

  featuredAuthors: Author[] = [
    {
      id: 1,
      name: 'Matt Haig',
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/S/amzn-author-media-prod/md2e4lqp99lrvr7q0c4ngcup34._SX450_.jpg',
      bio: 'Matt Haig is a British author for children and adults. His memoir Reasons to Stay Alive was a number one bestseller.',
      bookCount: 12
    },
    {
      id: 2,
      name: 'James Clear',
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/S/amzn-author-media-prod/3l4kfvkk2c4l70nac3ll6k2lkj._SX450_.jpg',
      bio: 'James Clear is an American author, entrepreneur, and photographer focusing on habits and continuous improvement.',
      bookCount: 3
    },
    {
      id: 3,
      name: 'Walter Isaacson',
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/S/amzn-author-media-prod/e6j34c8jqjj75q3t9s4895rp45._SX450_.jpg',
      bio: 'Walter Isaacson is an American author, journalist, and professor known for his biographies of historical figures.',
      bookCount: 8
    },
    {
      id: 4,
      name: 'Alex Michaelides',
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/S/amzn-author-media-prod/5i5ujg35h4l77k9c0s776u2rk4._SX450_.jpg',
      bio: 'Alex Michaelides is a bestselling author and screenwriter known for psychological thrillers.',
      bookCount: 3
    }
  ];

  categories: Category[] = [
    {
      id: 1,
      name: 'Mystery & Thriller',
      icon: 'fas fa-magnifying-glass',
      color: '#9333EA',
      route: 'mystery-thriller'
    },
    {
      id: 2,
      name: 'Business',
      icon: 'fas fa-briefcase',
      color: '#3B82F6',
      route: 'business'
    },
    {
      id: 3,
      name: 'Fiction',
      icon: 'fas fa-book',
      color: '#EF4444',
      route: 'fiction'
    },
    {
      id: 4,
      name: 'Biography',
      icon: 'fas fa-user',
      color: '#10B981',
      route: 'biography'
    },
    {
      id: 5,
      name: 'Children',
      icon: 'fas fa-child',
      color: '#F59E0B',
      route: 'children'
    }
  ];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart updates
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.cartItemCount = items.length;
      this.cartTotal = items.reduce((total, item) => total + (item.book.price * item.quantity), 0);
    });

    // Subscribe to auth state
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // Subscribe to wishlist updates
    this.wishlistService.wishlist$.subscribe(items => {
      this.wishlistCount = items.length;
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: {
          q: this.searchQuery,
          category: this.searchCategory
        }
      });
    }
  }

  removeFromCart(bookId: number): void {
    this.cartService.removeFromCart(bookId);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onCheckout(): void {
    if (this.cartItems.length > 0) {
      const message = `Thank you for your order!\nTotal Amount: ${this.cartTotal.toFixed(2)}\nNumber of Items: ${this.cartItems.length}`;
      alert(message);
      // Clear the cart after successful checkout
      this.cartService.clearCart();
      // Navigate to home page
      this.router.navigate(['/']);
    }
  }
} 