import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookComponent } from '../book/book.component';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule, BookComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="container mx-auto px-4">
        <!-- Back button -->
        <button 
          (click)="goBack()"
          class="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Categories
        </button>

        <!-- Category Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ getCategoryName() }}</h1>
          <p class="text-lg text-gray-600">Explore our collection of {{ getCategoryName().toLowerCase() }} books</p>
        </div>

        <!-- Books Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-book *ngFor="let book of filteredBooks" [book]="book"></app-book>
        </div>

        <!-- No Books Found -->
        <div *ngIf="!filteredBooks.length" class="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">No Books Found</h2>
          <p class="text-gray-600">No books are currently available in this category.</p>
        </div>
      </div>
    </div>
  `
})
export class CategoryComponent implements OnInit {
  categoryId: string = '';
  filteredBooks: Book[] = [];

  // Sample books data - in a real app, this would come from a service
  private allBooks: Book[] = [
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

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.filterBooks();
    });
  }

  filterBooks() {
    // Convert route parameter to category name
    const categoryName = this.getCategoryName();
    this.filteredBooks = this.allBooks.filter(book => 
      book.category.toLowerCase() === categoryName.toLowerCase()
    );
  }

  getCategoryName(): string {
    // Convert route parameter to display name
    switch (this.categoryId) {
      case 'mystery-thriller':
        return 'Mystery & Thriller';
      case 'business':
        return 'Business';
      case 'historical-fiction':
        return 'Historical Fiction';
      case 'biography':
        return 'Biography';
      case 'rom-com':
        return 'Romance';
      default:
        return 'All Books';
    }
  }

  goBack() {
    window.history.back();
  }
} 