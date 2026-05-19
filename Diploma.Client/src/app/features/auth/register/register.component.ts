import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  errorMessages: string[] = [];

  // 🔥 ОНОВЛЕНО: Додано поле confirmPassword та кастомний валідатор matchPasswords
  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.matchPasswords });

  // 🔐 КАСТОМНИЙ ВАЛІДАТОР: Перевірка збігу паролів
  matchPasswords(control: AbstractControl): Record<string, boolean> | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessages = [];
      
      // Відправляємо на бекенд тільки email та password (confirmPassword серверу не потрібен)
      const { email, password } = this.registerForm.value;

      this.authService.register({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (Array.isArray(err.error) && err.error.length > 0) {
            this.errorMessages = err.error;
          } else if (typeof err.error === 'string') {
            this.errorMessages = [err.error];
          } else {
            this.errorMessages = ['Помилка реєстрації. Перевірте введені дані.'];
          }
          this.cdr.detectChanges();
        }
      });
    }
  }
}