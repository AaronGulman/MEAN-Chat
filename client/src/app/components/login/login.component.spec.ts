import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoginComponent,
        FormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: spy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login on the AuthService when credentials are provided', () => {
    const mockResponse = { valid: true };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.username = 'testUser';
    component.password = 'password';

    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith('testUser', 'password');
  });

  it('should navigate to dashboard on successful login', () => {
    const mockResponse = { valid: true };
    authServiceSpy.login.and.returnValue(of(mockResponse));
    spyOn(window, 'alert');
    const routerSpy = spyOn(component['router'], 'navigate');

    component.username = 'testUser';
    component.password = 'password';

    component.onLogin();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should alert on failed login due to invalid credentials', () => {
    const mockResponse = { valid: false };
    authServiceSpy.login.and.returnValue(of(mockResponse));
    spyOn(window, 'alert');

    component.username = 'testUser';
    component.password = 'wrongPassword';

    component.onLogin();

    expect(window.alert).toHaveBeenCalledWith('Login failed. Please check your credentials and try again.');
  });

  it('should alert on login error', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Error occurred during login')));
    spyOn(window, 'alert');

    component.username = 'testUser';
    component.password = 'password';

    component.onLogin();

    expect(window.alert).toHaveBeenCalledWith('Error occurred during login');
  });
});