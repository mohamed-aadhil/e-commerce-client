import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, take } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

interface DashboardStats {
  totalBooks: number;
  lowStock: number;
  totalValue: number;
  outOfStock: number;
}

interface Book {
  isbn: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  stock: number;
  status: string;
}

// Mock API endpoints for backend reference
const API_BASE = '/api/admin-dashboard/books';
const API_STATS = '/api/admin-dashboard/books/stats';
const API_GENRES = '/api/admin-dashboard/books/genres'; // GET all genres
const API_BOOKS_BY_GENRE = (genre: string) => `/api/admin-dashboard/books/genres/${encodeURIComponent(genre)}/books`; // GET books by genre
const API_SEARCH_BOOKS = (query: string) => `/api/admin-dashboard/books/search?isbn=${encodeURIComponent(query)}`; // GET search by ISBN
const API_ADD_BOOK = API_BASE; // POST
const API_UPDATE_BOOK = (isbn: string) => `${API_BASE}/${isbn}`; // PUT
const API_DELETE_BOOK = (isbn: string) => `${API_BASE}/${isbn}`; // DELETE
const API_GET_BOOK = (isbn: string) => `${API_BASE}/${isbn}`; // GET

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  books: Book[] = [];
  statsError = '';
  booksError = '';
  userName: string | null = null;
  showLogoutDropdown = false;
  genres: string[] = [];
  selectedGenre: string = 'All Genres';
  searchQuery: string = '';
  searchSuggestions: Book[] = [];
  genresError = '';
  searchError = '';
  loading = true;

  private statsUrl = API_STATS;
  private booksUrl = API_BASE;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('ngOnInit: Token at dashboard init:', this.authService.getToken());
    this.authService.isAuthenticated$
      .pipe(take(1))
      .subscribe(isAuth => {
        if (isAuth) {
          this.loading = false;
          this.fetchStats();
          this.fetchBooks();
          this.fetchGenres();
          this.userName = this.authService.getUserName();
        } else {
          this.loading = true;
          this.router.navigate(['/login']);
        }
      });
  }

  fetchStats() {
    console.log('fetchStats: Token before request:', this.authService.getToken());
    this.http.get<DashboardStats>(this.statsUrl).pipe(
      catchError(() => {
        this.statsError = 'No data found';
        return of(null);
      })
    ).subscribe(data => {
      this.stats = data;
    });
  }

  fetchBooks() {
    console.log('fetchBooks: Token before request:', this.authService.getToken());
    this.http.get<Book[]>(this.booksUrl).pipe(
      catchError(() => {
        this.booksError = 'No data found';
        return of([]);
      })
    ).subscribe(data => {
      this.books = data || [];
    });
  }

  fetchGenres() {
    console.log('fetchGenres: Token before request:', this.authService.getToken());
    this.http.get<string[]>(API_GENRES).pipe(
      catchError(() => {
        this.genresError = 'No data found';
        return of([]);
      })
    ).subscribe(data => {
      this.genres = data || [];
    });
  }

  onGenreChange(genre: string) {
    this.selectedGenre = genre;
    if (genre === 'All Genres') {
      this.fetchBooks();
    } else {
      this.http.get<Book[]>(API_BOOKS_BY_GENRE(genre)).pipe(
        catchError(() => {
          this.booksError = 'No data found';
          return of([]);
        })
      ).subscribe(data => {
        this.books = data || [];
      });
    }
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    if (!query) {
      this.searchSuggestions = [];
      return;
    }
    this.http.get<Book[]>(API_SEARCH_BOOKS(query)).pipe(
      catchError(() => {
        this.searchError = 'No data found';
        return of([]);
      })
    ).subscribe(data => {
      this.searchSuggestions = data || [];
    });
  }

  onSelectSuggestion(book: Book) {
    this.books = [book];
    this.searchSuggestions = [];
    this.searchQuery = book.isbn;
  }

  toggleLogoutDropdown() {
    this.showLogoutDropdown = !this.showLogoutDropdown;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
    this.showLogoutDropdown = false;
  }

  editBook(book: Book) {
    // Navigate to the add-book page with the book's ISBN for editing
    this.router.navigate(['/add-book', book.isbn]);
  }

  addBook(book: Book) {
    // POST to add a new book
    this.http.post<Book>(API_ADD_BOOK, book).pipe(
      catchError(() => {
        this.booksError = 'No data found';
        return of(null);
      })
    ).subscribe();
  }

  updateBook(isbn: string, book: Book) {
    // PUT to update a book
    this.http.put<Book>(API_UPDATE_BOOK(isbn), book).pipe(
      catchError(() => {
        this.booksError = 'No data found';
        return of(null);
      })
    ).subscribe();
  }

  deleteBook(book: Book) {
    // DELETE to remove a book
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      this.http.delete(API_DELETE_BOOK(book.isbn)).pipe(
        catchError(() => {
          this.booksError = 'No data found';
          return of(null);
        })
      ).subscribe(() => {
        this.books = this.books.filter(b => b.isbn !== book.isbn);
      });
    }
  }

  getBook(isbn: string) {
    // GET a single book
    return this.http.get<Book>(API_GET_BOOK(isbn)).pipe(
      catchError(() => {
        this.booksError = 'No data found';
        return of(null);
      })
    );
  }
}
