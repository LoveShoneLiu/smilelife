import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline, lockClosedOutline, personOutline } from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonSpinner,
    IonText,
  ],
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Pre-filled for the mock build; remove these defaults when real accounts are enabled.
  account = 'alex@smilelife.co.nz';
  password = 'Smile123';
  showPassword = false;
  submitted = false;

  readonly loading = this.authService.loading;
  readonly error = this.authService.error;

  constructor() {
    addIcons({ eyeOffOutline, eyeOutline, lockClosedOutline, personOutline });
  }

  get accountInvalid(): boolean {
    return this.submitted && !this.account.trim();
  }

  get passwordInvalid(): boolean {
    return this.submitted && !this.password;
  }

  async submit(): Promise<void> {
    this.submitted = true;
    this.authService.clearError();

    // Keep form validation local; AuthService only handles authentication state.
    if (this.accountInvalid || this.passwordInvalid) {
      return;
    }

    try {
      await this.authService.login({
        account: this.account,
        password: this.password,
      });
      await this.router.navigateByUrl('/folder/inbox', { replaceUrl: true });
    } catch {
      // AuthService owns the user-facing error message.
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
