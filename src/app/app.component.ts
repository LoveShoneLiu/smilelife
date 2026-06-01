
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote, IonRouterLink, IonRouterOutlet, IonSplitPane } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, archiveSharp, bookmarkOutline, bookmarkSharp, calendarOutline, calendarSharp, checkmarkCircleOutline, checkmarkCircleSharp, logOutOutline, mailOutline, mailSharp, mapOutline, mapSharp, paperPlaneOutline, paperPlaneSharp, warningOutline, warningSharp } from 'ionicons/icons';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonButton, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;

  // These routes are placeholders for the first task-board sections.
  // They can be replaced with dedicated feature routes as the workflow grows.
  public appPages = [
    { title: 'Today', url: '/folder/inbox', icon: 'calendar' },
    { title: 'En Route', url: '/folder/en-route', icon: 'map' },
    { title: 'Pending Approval', url: '/folder/pending-confirm', icon: 'paper-plane' },
    { title: 'Completed', url: '/folder/completed', icon: 'checkmark-circle' },
    { title: 'Exceptions', url: '/folder/exceptions', icon: 'warning' },
    { title: 'History', url: '/folder/history', icon: 'archive' },
  ];

  constructor() {
    addIcons({
      archiveOutline,
      archiveSharp,
      bookmarkOutline,
      bookmarkSharp,
      calendarOutline,
      calendarSharp,
      checkmarkCircleOutline,
      checkmarkCircleSharp,
      logOutOutline,
      mailOutline,
      mailSharp,
      mapOutline,
      mapSharp,
      paperPlaneOutline,
      paperPlaneSharp,
      warningOutline,
      warningSharp,
    });
  }

  async logout(): Promise<void> {
    this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
