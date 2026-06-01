import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
  SegmentCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  chevronForwardOutline,
  locationOutline,
  refreshOutline,
  timeOutline,
} from 'ionicons/icons';

import { TaskStatus, TaskSummary } from '../../models/task.model';
import { TASK_STATUS_META, TaskService } from '../../services/task.service';

type TaskBoardView = 'today' | 'en-route' | 'pending-confirm' | 'completed' | 'exceptions' | 'history';
type StatusFilter = 'all' | TaskStatus;

interface TaskGroup {
  status: TaskStatus;
  label: string;
  tasks: TaskSummary[];
}

const VIEW_STATUS_MAP: Record<TaskBoardView, StatusFilter> = {
  today: 'all',
  'en-route': 'enRoute',
  'pending-confirm': 'pendingConfirm',
  completed: 'completed',
  exceptions: 'exception',
  history: 'completed',
};

const PAGE_TITLES: Record<TaskBoardView, string> = {
  today: 'Today',
  'en-route': 'En Route',
  'pending-confirm': 'Pending Approval',
  completed: 'Completed',
  exceptions: 'Exceptions',
  history: 'History',
};

const STATUS_ORDER: TaskStatus[] = [
  'pending',
  'enRoute',
  'arrived',
  'inProgress',
  'pendingConfirm',
  'completed',
  'exception',
];

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.page.html',
  styleUrls: ['./task-board.page.scss'],
  imports: [
    DatePipe,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonList,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class TaskBoardPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly pageView = signal<TaskBoardView>('today');
  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly tasks = this.taskService.tasks;
  readonly loading = this.taskService.loading;
  readonly lastUpdatedAt = this.taskService.lastUpdatedAt;
  readonly pageTitle = computed(() => PAGE_TITLES[this.pageView()]);

  readonly visibleTasks = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.tasks()
      .filter((task) => status === 'all' || task.status === status)
      .filter((task) => this.matchesSearch(task, query))
      .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime());
  });

  readonly taskGroups = computed<TaskGroup[]>(() => {
    const tasks = this.visibleTasks();

    return STATUS_ORDER
      .map((status) => ({
        status,
        label: TASK_STATUS_META[status].label,
        tasks: tasks.filter((task) => task.status === status),
      }))
      .filter((group) => group.tasks.length > 0);
  });

  constructor() {
    addIcons({
      alertCircleOutline,
      calendarOutline,
      chevronForwardOutline,
      locationOutline,
      refreshOutline,
      timeOutline,
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const view = this.normalizeView(params.get('view'));
      this.pageView.set(view);
      this.statusFilter.set(VIEW_STATUS_MAP[view]);
    });
  }

  async refresh(event?: RefresherCustomEvent): Promise<void> {
    await this.taskService.refreshTasks();
    event?.target.complete();
  }

  setStatusFilter(event: SegmentCustomEvent): void {
    this.statusFilter.set((event.detail.value as StatusFilter | undefined) ?? 'all');
  }

  setSearchTerm(event: CustomEvent): void {
    this.searchTerm.set((event.detail as { value?: string }).value ?? '');
  }

  statusLabel(status: TaskStatus): string {
    return TASK_STATUS_META[status].label;
  }

  statusTone(status: TaskStatus): string {
    return TASK_STATUS_META[status].tone;
  }

  priorityLabel(priority: TaskSummary['priority']): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  openTask(task: TaskSummary): void {
    void this.router.navigate(['/tasks/detail', task.id]);
  }

  private normalizeView(value: string | null): TaskBoardView {
    const view = value as TaskBoardView | null;
    return view && view in PAGE_TITLES ? view : 'today';
  }

  private matchesSearch(task: TaskSummary, query: string): boolean {
    if (!query) {
      return true;
    }

    return [
      task.title,
      task.taskNumber,
      task.customerName,
      task.address,
      TASK_STATUS_META[task.status].label,
      task.priority,
    ].some((value) => value.toLowerCase().includes(query));
  }
}
