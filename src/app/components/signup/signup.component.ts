import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.signup(this.name, this.email, this.password).subscribe({
      next: () => {
        this.successMessage = 'Registration successful!';
        this.isSubmitting = false;
        // Optionally, redirect to login or dashboard
      },
      error: (err) => {
        this.handleSignupError(err);
      }
    });
  }

  private handleSignupError(err: any) {
    if (err.status === 0) {
      this.errorMessage = 'Cannot connect to the server. Please check your internet connection.';
    } else if (err.status === 400) {
      this.errorMessage = 'Invalid registration data. Please check your input.';
    } else if (err.status === 409) {
      this.errorMessage = 'Email already exists.';
    } else {
      this.errorMessage = `Registration failed: ${err.message || 'Unknown error'}`;
    }
    this.isSubmitting = false;
  }
} 