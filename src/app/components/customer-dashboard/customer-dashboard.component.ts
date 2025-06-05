import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashbaord.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  userName: string | null = null;
  showDropdown = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.name$
      .pipe(take(1))
      .subscribe(name => {
        this.userName = name;
      });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  onUserIconClick() {
    if (!this.userName) {
      this.router.navigate(['/login']);
    } else {
      this.toggleDropdown();
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
    this.showDropdown = false;
  }
} 