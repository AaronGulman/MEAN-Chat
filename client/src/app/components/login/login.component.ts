import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class LoginComponent {
  // User credentials input fields
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Function triggered when user clicks the "Login" button
  onLogin() {
    // Call the AuthService's login function with provided username and password
    this.authService.login(this.username, this.password).subscribe({
      next: (data: any) => {
        // Log the response data
        console.log(data);
        // If login is successful, navigate to the dashboard
        if (data.valid) {
          console.log('Login successful', data);
          this.router.navigate(['/dashboard']);
        } else {
          // Show alert if login credentials are incorrect
          alert('Login failed. Please check your credentials and try again.');
        }
      },
      error: (error) => {
        // Log any errors that occur during login
        console.error('Login failed', error);
        // Show alert if an error occurs during login
        alert('Error occurred during login');
      },
    });
  }
}
