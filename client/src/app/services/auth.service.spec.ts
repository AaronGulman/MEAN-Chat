import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from './user.service';


describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['setLoggedInUser']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        AuthService,
        { provide: UserService, useValue: spy },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully with valid credentials', () => {
    const username = 'testUser';
    const password = 'password';
    const mockResponse = { valid: true };

    service.login(username, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(userServiceSpy.setLoggedInUser).toHaveBeenCalledWith(username);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });
    req.flush(mockResponse);
  });

  it('should return invalid credentials message when login fails', () => {
    const username = 'testUser';
    const password = 'wrongPassword';
    const mockResponse = { valid: false, message: 'Invalid credentials' };

    service.login(username, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });
    req.flush(mockResponse);
  });

  it('should register a new user successfully', () => {
    const username = 'newUser';
    const email = 'newUser@example.com';
    const password = 'password';
    const mockResponse = { valid: true };

    service.register(username, email, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, email, password });
    req.flush(mockResponse);
  });

  it('should handle registration failure', () => {
    const username = 'newUser';
    const email = 'newUser@example.com';
    const password = 'password';
    const mockResponse = { valid: false };

    service.register(username, email, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, email, password });
    req.flush(mockResponse);
  });

  it('should get logged in user from sessionStorage', () => {
    const username = 'loggedInUser';
    sessionStorage.setItem('loggedInUser', JSON.stringify(username));

    const loggedInUser = service.getLoggedInUser();
    expect(loggedInUser).toEqual(username);
  });

  it('should clear logged in user from sessionStorage', () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify('loggedInUser'));
    service.clearLoggedInUser();

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    expect(loggedInUser).toBeNull();
  });
});