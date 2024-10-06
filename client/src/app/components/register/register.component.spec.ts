import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        RegisterComponent,
        FormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: spy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call register on the AuthService when form is valid', () => {
    const mockResponse = { valid: true };
    authServiceSpy.register.and.returnValue(of(mockResponse));

    component.username = 'testUser';
    component.email = 'testUser@example.com';
    component.password = 'password';

    const registerForm = {
      valid: true,
    } as NgForm;

    component.onRegister(registerForm);

    expect(authServiceSpy.register).toHaveBeenCalledWith('testUser', 'testUser@example.com', 'password');
  });

  it('should navigate to dashboard and alert on successful registration', () => {
    const mockResponse = { valid: true };
    authServiceSpy.register.and.returnValue(of(mockResponse));
    spyOn(window, 'alert');
    const routerSpy = spyOn(component['router'], 'navigate');

    component.username = 'testUser';
    component.email = 'testUser@example.com';
    component.password = 'password';

    const registerForm = {
      valid: true,
    } as NgForm;

    component.onRegister(registerForm);

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(window.alert).toHaveBeenCalledWith('Register successful!');
  });

  it('should alert on registration failure', () => {
    authServiceSpy.register.and.returnValue(throwError(() => new Error('User Already Exists!')));
    spyOn(window, 'alert');

    component.username = 'testUser';
    component.email = 'testUser@example.com';
    component.password = 'password';

    const registerForm = {
      valid: true,
    } as NgForm;

    component.onRegister(registerForm);

    expect(window.alert).toHaveBeenCalledWith('User Already Exists!');
  });

  it('should alert when form is invalid', () => {
    spyOn(window, 'alert');

    const registerForm = {
      valid: false,
    } as NgForm;

    component.onRegister(registerForm);

    expect(window.alert).toHaveBeenCalledWith('Please fill out the form correctly.');
  });
});