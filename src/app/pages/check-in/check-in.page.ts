import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, locationOutline, navigateOutline, timeOutline } from 'ionicons/icons';

import { TaskDetail } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.page.html',
  styleUrls: ['./check-in.page.scss'],
  imports: [
    DatePipe,
    DecimalPipe,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class CheckInPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly taskId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = this.taskService.loading;
  readonly task = computed<TaskDetail | null>(() => {
    const id = this.taskId();
    return id ? this.taskService.getTask(id) : null;
  });
  readonly latestCheckIn = computed(() => this.task()?.checkIns[0] ?? null);

  constructor() {
    addIcons({ checkmarkCircleOutline, locationOutline, navigateOutline, timeOutline });
  }

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    this.taskId.set(taskId);

    if (!taskId || !this.taskService.getTask(taskId)) {
      this.error.set('Task not found');
    }
  }

  async checkIn(): Promise<void> {
    const task = this.task();

    if (!task) {
      return;
    }

    this.error.set(null);

    try {
      await this.taskService.checkInTask(task.id);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to check in');
    }
  }

  openNavigation(): void {
    const task = this.task();

    if (!task) {
      return;
    }

    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`, '_blank');
  }

  async done(): Promise<void> {
    const task = this.task();
    await this.router.navigate(['/tasks/detail', task?.id ?? '']);
  }
}
