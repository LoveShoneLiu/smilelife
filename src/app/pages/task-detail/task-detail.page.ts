import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonBadge,
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
import {
  alertCircleOutline,
  callOutline,
  checkmarkCircleOutline,
  clipboardOutline,
  locationOutline,
  navigateOutline,
  pencilOutline,
  personOutline,
  timeOutline,
} from 'ionicons/icons';

import { TaskAction, TaskDetail, TaskStatus } from '../../models/task.model';
import { MapService } from '../../services/map.service';
import { TASK_STATUS_META, TaskService } from '../../services/task.service';

interface TaskActionItem {
  action: TaskAction;
  label: string;
  icon: string;
  color: string;
}

const PRIMARY_ACTIONS: Partial<Record<TaskStatus, TaskActionItem>> = {
  pending: { action: 'START_TRAVEL', label: 'Start Travel', icon: 'navigate-outline', color: 'primary' },
  enRoute: { action: 'CHECK_IN', label: 'Check In', icon: 'location-outline', color: 'primary' },
  arrived: { action: 'START_WORK', label: 'Start Work', icon: 'clipboard-outline', color: 'primary' },
  inProgress: { action: 'FINISH_WORK', label: 'Finish Work', icon: 'checkmark-circle-outline', color: 'warning' },
  pendingConfirm: {
    action: 'COMPLETE_WITH_SIGNATURE',
    label: 'Capture Approval',
    icon: 'pencil-outline',
    color: 'success',
  },
  exception: { action: 'RESUME_JOB', label: 'Resume Job', icon: 'checkmark-circle-outline', color: 'primary' },
};

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  imports: [
    DatePipe,
    IonBackButton,
    IonBadge,
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
export class TaskDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mapService = inject(MapService);
  private readonly taskService = inject(TaskService);

  readonly taskId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = this.taskService.loading;
  readonly task = computed<TaskDetail | null>(() => {
    const id = this.taskId();
    return id ? this.taskService.getTask(id) : null;
  });
  readonly primaryAction = computed(() => {
    const task = this.task();
    return task ? PRIMARY_ACTIONS[task.status] ?? null : null;
  });

  constructor() {
    addIcons({
      alertCircleOutline,
      callOutline,
      checkmarkCircleOutline,
      clipboardOutline,
      locationOutline,
      navigateOutline,
      pencilOutline,
      personOutline,
      timeOutline,
    });
  }

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    this.taskId.set(taskId);

    if (!taskId || !this.taskService.getTask(taskId)) {
      this.error.set('Task not found');
    }
  }

  statusLabel(status: TaskStatus): string {
    return TASK_STATUS_META[status].label;
  }

  statusTone(status: TaskStatus): string {
    return TASK_STATUS_META[status].tone;
  }

  async runAction(action: TaskAction): Promise<void> {
    const task = this.task();

    if (!task) {
      return;
    }

    if (action === 'CHECK_IN') {
      await this.openCheckIn();
      return;
    }

    if (action === 'COMPLETE_WITH_SIGNATURE') {
      await this.openSignature();
      return;
    }

    this.error.set(null);

    try {
      await this.taskService.transitionTask(task.id, action);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to update task');
    }
  }

  async reportIssue(): Promise<void> {
    await this.runAction('REPORT_ISSUE');
  }

  async openCheckIn(): Promise<void> {
    const task = this.task();

    if (task) {
      await this.router.navigate(['/tasks', task.id, 'check-in']);
    }
  }

  async openNavigation(): Promise<void> {
    const task = this.task();

    if (!task) {
      return;
    }

    await this.mapService.openNavigation({ address: task.address });
  }

  async openSignature(): Promise<void> {
    const task = this.task();

    if (task) {
      await this.router.navigate(['/tasks', task.id, 'signature']);
    }
  }

  async goBack(): Promise<void> {
    await this.router.navigate(['/tasks/today']);
  }
}
