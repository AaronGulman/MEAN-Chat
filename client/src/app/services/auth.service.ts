import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from './user.service';

// Set the HTTP options with appropriate headers
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base URL for API requests
  private apiUrl = 'https://localhost:3000/api';

  constructor(private http: HttpClient, private userService: UserService) {}

  /**
   * @description Sends a login request to the backend API and processes the response.
   * If login is successful, the user's data is saved using UserService.
   * @param username - Username provided by the user
   * @param password - Password provided by the user
   * @returns Observable containing login response information
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }, httpOptions).pipe(
      map(response => {
        if (response.valid) {
          // Save the logged-in user's information to sessionStorage
          this.userService.setLoggedInUser(username);
          return response;
        } else {
          return { valid: false, message: 'Invalid credentials' };
        }
      }),
      // Handle any errors encountered during the login process
      catchError(error => {
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  /**
   * @description Sends a registration request to the backend API and processes the response.
   * After successful registration, the user can optionally be auto-logged in.
   * @param username - Desired username for the new user
   * @param email - Email address for the new user
   * @param password - Desired password for the new user
   * @returns Observable containing registration response information
   */
  register(username: string, email: string, password: string): Observable<any> {
    const registerData = { username, email, password };
    return this.http.post<any>(`${this.apiUrl}/register`, registerData, httpOptions).pipe(
      map(response => {
        if (response.valid) {
          // Optionally, you could auto-login the user after successful registration
          // this.userService.setLoggedInUser(username);
          return response;
        } else {
          return { valid: false };
        }
      }),
      // Handle any errors encountered during the registration process
      catchError(error => {
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  /**
   * @description Retrieves the logged-in user's username from sessionStorage.
   * @returns Username of the logged-in user or null if no user is logged in
   */
  getLoggedInUser(): string {
    const username = sessionStorage.getItem('loggedInUser');
    return username ? JSON.parse(username) : null;
  }

  /**
   * @description Clears the logged-in user's information from sessionStorage.
   */
  clearLoggedInUser(): void {
    sessionStorage.removeItem('loggedInUser');
  }
}
