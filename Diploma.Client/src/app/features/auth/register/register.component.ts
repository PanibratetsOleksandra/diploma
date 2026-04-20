import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  private cdr = inject(ChangeDetectorRef); // ⬅️ ОЦЕ

  errorMessages: string[] = [];

  registerForm: FormGroup = this.fb.group({
    // fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessages = []; // Очищуємо перед запитом

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/login']);
        },
        error: (err) => {

          // BadRequest(List<string>)
          if (Array.isArray(err.error) && err.error.length > 0) {
            this.errorMessages = err.error;
          }
          // BadRequest("message")
          else if (typeof err.error === 'string') {
            this.errorMessages = [err.error];
          }
          else {
            this.errorMessages = ['Помилка реєстрації. Перевірте введені дані.'];
          }

          console.log('UI errors: - register.component.ts:49', this.errorMessages);
          this.cdr.detectChanges(); 
        }
      });
    }
  }
}