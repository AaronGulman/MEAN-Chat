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
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(registerForm: NgForm) {
    if (registerForm.valid) {
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: (data: any) => {
          console.log('Register successful', data);
          this.router.navigate(['/dashboard']);
          alert('Register successful!');
        },
        error: (error) => {
          console.error('Register failed', error);
          alert('User Already Exists!');
        },
      });
    } else {
      alert('Please fill out the form correctly.');
    }
  }
}
