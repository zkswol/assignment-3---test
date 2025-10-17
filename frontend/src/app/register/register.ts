import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // 👈 import it


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerForm: FormGroup;
  serverMessage = '';
  loading = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private router: Router) {
    // initialize form
    this.registerForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[A-Za-z\s\-'']+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)]],
      confirmPassword: ['', [Validators.required]],
      role: ['user'],
      phone: ['', [Validators.pattern(/^(\+61|0)[2-9]\d{8}$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  // 🧠 This runs when you click the Register button
  onSubmit() {
    if (this.registerForm.invalid) {
      this.serverMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;

    // 💥 here’s your POST request
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: (res: any) => {
          this.serverMessage = res.message || 'User registered successfully! Please log in.';
          this.loading = false;
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.serverMessage = err.error?.error || 'Registration failed!';
          this.loading = false;
        }
      });
  }
}