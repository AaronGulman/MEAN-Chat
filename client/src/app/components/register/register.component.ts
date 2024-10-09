import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  // Registration input fields for username, email, and password
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Function triggered when user submits the registration form
  onRegister(registerForm: NgForm) {
    // Check if the form is valid before proceeding with registration
    if (registerForm.valid) {
      // Call the AuthService's register function with the provided username, email, and password
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: (data: any) => {
          // Log the successful registration response
          console.log('Register successful', data);
          // Navigate to the dashboard after successful registration
          this.router.navigate(['/dashboard']);
          // Notify the user of successful registration
          alert('Register successful!');
        },
        error: (error) => {
          // Log the registration error
          console.error('Register failed', error);
          // Show alert if registration fails (e.g., user already exists)
          alert('User Already Exists!');
        },
      });
    } else {
      // Show alert if the form is not filled out correctly
      alert('Please fill out the form correctly.');
    }
  }
}
