import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isSubmitting = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      const role = this.authService.getUserRole();
      if (role === 'Admin') {
        this.router.navigate(['/admin-dashboard']);
      } else if (role === 'Customer') {
        this.router.navigate(['/customer-dashboard']);
      }
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        const role = this.authService.getUserRole();
        if (role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'Customer') {
          this.router.navigate(['/customer-dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.handleLoginError(err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  private handleLoginError(err: any) {
    if (err.status === 0) {
      this.errorMessage = 'Cannot connect to the server. Please check your internet connection.';
    } else if (err.status === 401) {
      this.errorMessage = 'Invalid email address or password';
    } else if (err.status === 403) {
      this.errorMessage = 'Access forbidden. Please check your credentials.';
    } else {
      this.errorMessage = `Login failed: ${err.message || 'Unknown error'}`;
    }
    this.isSubmitting = false;
  }
}


