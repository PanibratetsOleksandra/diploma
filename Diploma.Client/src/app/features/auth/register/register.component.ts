import { Component, inject,ChangeDetectorRef } from '@angular/core';
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
    fullName: ['', [Validators.required]],
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

     
  this.errorMessages = [];

  console.log('FULL BACKEND ERROR: - register.component.ts:40', err.error);

  // ASP.NET Core ModelState errors
  if (err.error?.errors && Object.keys(err.error.errors).length > 0) {
    Object.values(err.error.errors).forEach((messages: any) => {
      this.errorMessages.push(...messages);
    });
  }
  // BadRequest(List<string>)
  else if (Array.isArray(err.error) && err.error.length > 0) {
    this.errorMessages = err.error;
  }
  // BadRequest("message")
  else if (typeof err.error === 'string') {
    this.errorMessages = [err.error];
  }
  else {
    this.errorMessages = ['Помилка реєстрації. Перевірте введені дані.'];
  }

  console.log('UI errors: - register.component.ts:60', this.errorMessages);
  this.cdr.detectChanges(); // 🔥 ОЦЕ САМО ГОЛОВНЕ



        // this.errorMessages.push(...err.error);
      //   console.log('Дані з сервера: - register.component.ts:35', err.error); // ПЕРЕВІРТЕ ЦЕ В КОНСОЛІ

      //   // Якщо сервер повернув масив рядків [ "Error 1", "Error 2" ]
      //   if (Array.isArray(err.error)) {
      //     // Важливо: створюємо НОВИЙ масив, щоб Angular спрацював на зміну посилання
      //     this.errorMessages = [...err.error]; 
      //   } 
      //   else if (typeof err.error === 'string') {
      //     this.errorMessages = [err.error];
      //   } 
      //   else {
      //     this.errorMessages = ['Невідома помилка валідації'];
      //   }
        
      //   // Додамо примусовий лог, щоб побачити, чи масив заповнився
      //   console.log('Помилки в компоненті: - register.component.ts:50', this.errorMessages);
       }
    });
  }
}
}