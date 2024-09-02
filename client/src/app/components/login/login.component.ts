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
  imports: [CommonModule,FormsModule,RouterModule],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (data:any) => {
        console.log(data);
        if (data.valid) {
          console.log('Login successful', data);
          //alert("Login Successful");
          this.router.navigate(['/dashboard']);
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
      },
      error: (error) => {
        console.error('Login failed', error);
        alert('Error occured during login');
      },
    });
  }
}
