// // import { Component, inject } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// // import { Router, RouterLink } from '@angular/router';
// // import { AuthService } from '../../../core/services/auth.service';


// // @Component({
// //   selector: 'app-login',
// //   standalone: true,
// //   imports: [CommonModule, ReactiveFormsModule, RouterLink],
// //   templateUrl: './login.component.html',
// //   // styleUrls: ['./login.component.css'] // Можна залишити порожнім, якщо використовуєте лише Tailwind
// // })
// // export class LoginComponent {
// //   private fb = inject(FormBuilder);
// //   private authService = inject(AuthService);
// //   private router = inject(Router);

// //   errorMessage: string = '';

// //   loginForm: FormGroup = this.fb.group({
// //     email: ['', [Validators.required, Validators.email]],
// //     password: ['', [Validators.required, Validators.minLength(6)]]
// //   });

  

// //   onSubmit() {
// //     if (this.loginForm.valid) {
// //       this.authService.login(this.loginForm.value).subscribe({
// //         next: () => this.router.navigate(['/shop']),
// //         error: () => this.errorMessage = 'Неправильна пошта або пароль. Спробуйте ще раз.'
// //       });
// //     }
// //   }
// // }

// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: './login.component.html',
// })
// export class LoginComponent {
//   private fb = inject(FormBuilder);
//   private authService = inject(AuthService);
//   private router = inject(Router);
//   private route = inject(ActivatedRoute);

//   errorMessage: string = '';

//   loginForm: FormGroup = this.fb.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(6)]]
//   });

//   onSubmit() {
//     if (this.loginForm.valid) {
//       this.authService.login(this.loginForm.value).subscribe({
//         next: () => {
//           const returnUrl =
//             this.route.snapshot.queryParamMap.get('returnUrl') || '/shop';

//           this.router.navigateByUrl(returnUrl);
//         },
//         error: () => {
//           this.errorMessage = 'Неправильна пошта або пароль. Спробуйте ще раз.';
//         }
//       });
//     }
//   }
// }



import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage: string = '';
  
  // 🔥 НОВІ СИГНАЛИ: Для модалки відновлення пароля
  isModalOpen = signal(false);
  resetEmail = signal('');
  isResetSubmitting = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     this.errorMessage = '';
  //     this.authService.login(this.loginForm.value).subscribe({
  //       next: () => this.router.navigate(['/shop']),
  //       error: () => this.errorMessage = 'Неправильна пошта або пароль. Спробуйте ще раз.'
  //     });
  //   }
  // }



  // 🔥 ОНОВЛЕНО: Розумний редірект після успішного входу (наприклад, назад у конструктор)
  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Зчитуємо returnUrl з queryParams, якщо його немає — за дефолтом шлемо в магазин /shop
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/shop';
          this.router.navigate([returnUrl]);
        },
        error: () => this.errorMessage = 'Неправильна пошта або пароль. Спробуйте ще раз.'
      });
    }
  }

  // 🔥 ДОДАТИ: Метод для обробки запиту на скидання пароля
  onResetPassword() {
    if (!this.resetEmail() || !this.resetEmail().includes('@')) {
      alert('Будь ласка, введіть коректну email адресу.');
      return;
    }

    this.isResetSubmitting.set(true);

    // Імітація або реальний виклик сервісу
    setTimeout(() => {
      alert(`Інструкції для відновлення пароля успішно надіслано на пошту: ${this.resetEmail()} ✨`);
      this.isResetSubmitting.set(false);
      this.closeResetModal();
    }, 1500);
  }

  openResetModal() {
    this.resetEmail.set('');
    this.isModalOpen.set(true);
  }

  closeResetModal() {
    this.isModalOpen.set(false);
  }
}