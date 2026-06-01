
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonMenu, IonMenuToggle, IonNote, IonRouterLink, IonRouterOutlet, IonSplitPane } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, archiveSharp, calendarOutline, calendarSharp, logOutOutline } from 'ionicons/icons';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonButton, IonSplitPane, IonMenu, IonContent, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;

  // Keep the drawer focused on top-level destinations; status filtering lives inside the task board.
  public appPages = [
    { title: 'Today', url: '/tasks/today', icon: 'calendar' },
    { title: 'History', url: '/tasks/history', icon: 'archive' },
  ];

  constructor() {
    addIcons({
      archiveOutline,
      archiveSharp,
      calendarOutline,
      calendarSharp,
      logOutOutline,
    });
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
