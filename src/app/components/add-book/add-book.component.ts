import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Mock API endpoints for backend reference
const API_BASE = '/api/admin-dashboard/books';
const API_ADD_BOOK = API_BASE; // POST
const API_UPDATE_BOOK = (isbn: string) => `${API_BASE}/${isbn}`; // PUT
const API_GET_BOOK = (isbn: string) => `${API_BASE}/${isbn}`; // GET

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css'],
})
export class AddBookComponent {
  bookForm: FormGroup;
  imagePreview: string = '';
  initialFormValue: any;
  message: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      genre: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isbn: ['', Validators.required],
      image: ['', Validators.required]
    });
    // Save the initial form value for change detection
    this.initialFormValue = this.bookForm.getRawValue();
  }

  updateImagePreview() {
    const url = this.bookForm.get('image')?.value;
    // Optionally, add more robust URL validation here
    this.imagePreview = url;
  }

  isFormUnchanged(): boolean {
    return JSON.stringify(this.bookForm.getRawValue()) === JSON.stringify(this.initialFormValue);
  }

  onSubmit() {
    this.message = '';
    if (this.bookForm.valid) {
      if (this.isFormUnchanged()) {
        this.message = 'No changes made';
        return;
      }
      console.log('Book Data:', this.bookForm.value);
      // Here you would send the data to the backend
      this.initialFormValue = this.bookForm.getRawValue(); // Update initial value after successful submit
    }
  }

  addBook(book: any) {
    // POST to add a new book
    this.http.post(API_ADD_BOOK, book).subscribe({
      next: () => { this.message = 'Book added successfully'; },
      error: () => { this.message = 'No data found'; }
    });
  }

  updateBook(isbn: string, book: any) {
    // PUT to update a book
    this.http.put(API_UPDATE_BOOK(isbn), book).subscribe({
      next: () => { this.message = 'Book updated successfully'; },
      error: () => { this.message = 'No data found'; }
    });
  }

  getBook(isbn: string) {
    // GET a single book
    this.http.get(API_GET_BOOK(isbn)).subscribe({
      next: (data) => { /* handle book data */ },
      error: () => { this.message = 'No data found'; }
    });
  }
} 