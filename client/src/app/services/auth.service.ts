import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from './user.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private userService: UserService) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }, httpOptions).pipe(
      map(response => {
        if (response.valid) {
          this.userService.setLoggedInUser(username);
          return response;
        } else {
          // Use UserService to check local storage
          const localUser = this.userService.getUserByUsername(username);
          if (localUser && localUser.password === password) {
            // Simulate a successful login response and save to sessionStorage
            this.userService.setLoggedInUser(username);
            return { valid: true };
          } else {
            return { valid: false };
          }
        }
      }),
      catchError(error => {
        return throwError(() => new Error('Login failed'));
      })
    );
  }
  

  register(username: string, email: string, password: string): Observable<any> {
    const registerData = { username, email, password };
    return this.http.post<any>(`${this.apiUrl}/register`, registerData, httpOptions).pipe(
      map(response => {
        if (response.valid) {
          // Use UserService to create a user if registration is successful
          const newUser = this.userService.createUser(username, email, password);
          console.log("New User Created: ",newUser);
          return { valid: true, ...newUser };
        } else {
          return { valid: false };
        }
      }),
      catchError(error => {
        return throwError(() => new Error('Registration failed'));
      })
    );
  }


  getLoggedInUser(): string | null {
    const username = sessionStorage.getItem('loggedInUser');
    return username ? JSON.parse(username) : null;
  }

  clearLoggedInUser(): void {
    sessionStorage.removeItem('loggedInUser');
  }
}
