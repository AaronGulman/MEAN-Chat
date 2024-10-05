import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from './user.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:3000/api';

  constructor(private http: HttpClient, private userService: UserService) {}

  // Use backend API for login
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }, httpOptions).pipe(
      map(response => {
        if (response.valid) {
          // Save the logged-in user to sessionStorage
          this.userService.setLoggedInUser(username);
          return response;
        } else {
          return { valid: false, message: 'Invalid credentials' };
        }
      }),
      catchError(error => {
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  // Use backend API for registration
  register(username: string, email: string, password: string): Observable<any> {
    const registerData = { username, email, password };
    return this.http.post<any>(`${this.apiUrl}/register`, registerData, httpOptions).pipe(
      map(response => {
        if (response.valid) {
          // Optionally, you could auto-login the user after successful registration
          //this.userService.setLoggedInUser(username);
          return response;
        } else {
          return { valid: false };
        }
      }),
      catchError(error => {
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  getLoggedInUser(): string {
    const username = sessionStorage.getItem('loggedInUser');
    return username ? JSON.parse(username) : null;
  }

  clearLoggedInUser(): void {
    sessionStorage.removeItem('loggedInUser');
  }
}
