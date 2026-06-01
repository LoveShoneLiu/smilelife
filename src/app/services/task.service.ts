import { Injectable, computed, signal } from '@angular/core';

import {
  CheckInRecord,
  NoteRecord,
  PhotoRecord,
  PhotoType,
  SignatureRecord,
  TaskAction,
  TaskDetail,
  TaskStatus,
  TaskStatusMeta,
} from '../models/task.model';

interface TaskState {
  tasks: TaskDetail[];
  loading: boolean;
  lastUpdatedAt: string | null;
}

const MOCK_TASKS: TaskDetail[] = [
  {
    id: 'task_1001',
    title: 'Heat pump service',
    taskNumber: 'SL-1001',
    customerName: 'Greenlane Dental',
    address: '214 Great South Road, Greenlane, Auckland',
    scheduleTime: '2026-06-01T09:30:00+12:00',
    status: 'pending',
    priority: 'high',
    contactName: 'Sarah Mitchell',
    contactPhone: '+64 21 456 900',
    description: 'Complete scheduled heat pump service and confirm the reception area unit is running quietly.',
    checkIns: [],
    photos: [],
    notes: [],
    signature: null,
    history: [
      {
        id: 'event_1001_1',
        type: 'TASK_ASSIGNED',
        title: 'Job assigned',
        actorName: 'Dispatch Team',
        createdAt: '2026-06-01T07:30:00+12:00',
      },
    ],
  },
  {
    id: 'task_1002',
    title: 'Chair hydraulic inspection',
    taskNumber: 'SL-1002',
    customerName: 'North Shore Smile Studio',
    address: '55 Lake Road, Takapuna, Auckland',
    scheduleTime: '2026-06-01T11:00:00+12:00',
    status: 'enRoute',
    priority: 'normal',
    contactName: 'James Walker',
    contactPhone: '+64 22 120 450',
    description: 'Inspect hydraulic movement on chair two and record any parts required.',
    checkIns: [],
    photos: [],
    notes: [],
    signature: null,
    history: [
      {
        id: 'event_1002_1',
        type: 'STATUS_CHANGED',
        title: 'Travel started',
        actorName: 'Alex Chen',
        createdAt: '2026-06-01T10:18:00+12:00',
      },
    ],
  },
  {
    id: 'task_1003',
    title: 'Compressor noise check',
    taskNumber: 'SL-1003',
    customerName: 'Wellington Family Dental',
    address: '18 Willis Street, Wellington Central',
    scheduleTime: '2026-06-01T13:30:00+12:00',
    status: 'arrived',
    priority: 'urgent',
    contactName: 'Mia Thompson',
    contactPhone: '+64 27 881 332',
    description: 'Investigate compressor noise reported during morning appointments.',
    checkIns: [
      {
        id: 'checkin_1003_1',
        latitude: -41.2888,
        longitude: 174.7772,
        createdAt: '2026-06-01T13:21:00+12:00',
        actorName: 'Alex Chen',
      },
    ],
    photos: [],
    notes: [],
    signature: null,
    history: [
      {
        id: 'event_1003_1',
        type: 'CHECKED_IN',
        title: 'Checked in on site',
        actorName: 'Alex Chen',
        createdAt: '2026-06-01T13:21:00+12:00',
        note: 'Reception confirmed access to plant room.',
      },
    ],
  },
  {
    id: 'task_1004',
    title: 'Steriliser maintenance',
    taskNumber: 'SL-1004',
    customerName: 'Hamilton Oral Care',
    address: '7 Victoria Street, Hamilton Central',
    scheduleTime: '2026-06-01T15:00:00+12:00',
    status: 'inProgress',
    priority: 'high',
    contactName: 'Oliver Brown',
    contactPhone: '+64 21 333 812',
    description: 'Perform steriliser maintenance and note cycle test result before handover.',
    checkIns: [],
    photos: [
      {
        id: 'photo_1004_1',
        type: 'before',
        note: 'Control panel before maintenance.',
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=640&q=80',
        status: 'uploaded',
        createdAt: '2026-06-01T15:12:00+12:00',
        actorName: 'Alex Chen',
      },
    ],
    notes: [
      {
        id: 'note_1004_1',
        text: 'Cycle test started after cleaning the tray seal.',
        createdAt: '2026-06-01T15:20:00+12:00',
        actorName: 'Alex Chen',
      },
    ],
    signature: null,
    history: [
      {
        id: 'event_1004_1',
        type: 'STATUS_CHANGED',
        title: 'Work started',
        actorName: 'Alex Chen',
        createdAt: '2026-06-01T15:06:00+12:00',
      },
    ],
  },
  {
    id: 'task_1005',
    title: 'Treatment light replacement',
    taskNumber: 'SL-1005',
    customerName: 'Christchurch Dental Group',
    address: '120 Riccarton Road, Christchurch',
    scheduleTime: '2026-06-01T16:30:00+12:00',
    status: 'pendingConfirm',
    priority: 'normal',
    contactName: 'Emily Roberts',
    contactPhone: '+64 29 500 019',
    description: 'Replace treatment light and collect customer approval after testing.',
    checkIns: [],
    photos: [],
    notes: [],
    signature: null,
    history: [
      {
        id: 'event_1005_1',
        type: 'STATUS_CHANGED',
        title: 'Work completed',
        actorName: 'Alex Chen',
        createdAt: '2026-06-01T16:48:00+12:00',
      },
    ],
  },
  {
    id: 'task_1006',
    title: 'Waterline flush verification',
    taskNumber: 'SL-1006',
    customerName: 'Ponsonby Dental',
    address: '33 Ponsonby Road, Auckland',
    scheduleTime: '2026-05-31T14:00:00+12:00',
    status: 'completed',
    priority: 'low',
    contactName: 'Noah Wilson',
    contactPhone: '+64 21 700 450',
    description: 'Verify waterline flush record and close maintenance visit.',
    checkIns: [],
    photos: [],
    notes: [],
    signature: {
      id: 'signature_1006_1',
      customerName: 'Noah Wilson',
      confirmationText: 'Approved',
      submittedAt: '2026-05-31T15:02:00+12:00',
      actorName: 'Alex Chen',
    },
    history: [
      {
        id: 'event_1006_1',
        type: 'CUSTOMER_APPROVED',
        title: 'Customer approved',
        actorName: 'Alex Chen',
        createdAt: '2026-05-31T15:02:00+12:00',
      },
    ],
  },
  {
    id: 'task_1007',
    title: 'X-ray unit access issue',
    taskNumber: 'SL-1007',
    customerName: 'Queenstown Lakes Dental',
    address: '9 Shotover Street, Queenstown',
    scheduleTime: '2026-06-01T10:45:00+12:00',
    status: 'exception',
    priority: 'urgent',
    contactName: 'Sophie Taylor',
    contactPhone: '+64 27 404 700',
    description: 'Site access issue blocked x-ray unit inspection. Confirm next appointment window.',
    checkIns: [],
    photos: [],
    notes: [],
    signature: null,
    history: [
      {
        id: 'event_1007_1',
        type: 'ISSUE_REPORTED',
        title: 'Exception reported',
        actorName: 'Alex Chen',
        createdAt: '2026-06-01T10:55:00+12:00',
        note: 'Practice manager unavailable and equipment room was locked.',
      },
    ],
  },
];

export const TASK_STATUS_META: Record<TaskStatus, TaskStatusMeta> = {
  pending: { label: 'Pending', tone: 'neutral' },
  enRoute: { label: 'En Route', tone: 'primary' },
  arrived: { label: 'Arrived', tone: 'primary' },
  inProgress: { label: 'In Progress', tone: 'warning' },
  pendingConfirm: { label: 'Pending Approval', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  exception: { label: 'Exception', tone: 'danger' },
};

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly state = signal<TaskState>({
    tasks: MOCK_TASKS,
    loading: false,
    lastUpdatedAt: new Date().toISOString(),
  });

  readonly tasks = computed(() => this.state().tasks);
  readonly loading = computed(() => this.state().loading);
  readonly lastUpdatedAt = computed(() => this.state().lastUpdatedAt);

  getTask(taskId: string): TaskDetail | null {
    return this.state().tasks.find((task) => task.id === taskId) ?? null;
  }

  async refreshTasks(): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true }));
    await this.delay(400);

    // This is the hand-off point for GET /api/tasks once the Next.js API is ready.
    this.state.update((state) => ({
      ...state,
      tasks: [...MOCK_TASKS],
      loading: false,
      lastUpdatedAt: new Date().toISOString(),
    }));
  }

  async transitionTask(taskId: string, action: TaskAction): Promise<TaskDetail> {
    this.state.update((state) => ({ ...state, loading: true }));
    await this.delay(350);

    const task = this.getTask(taskId);

    if (!task) {
      this.state.update((state) => ({ ...state, loading: false }));
      throw new Error('Task not found');
    }

    const nextStatus = this.nextStatus(task.status, action);

    if (!nextStatus) {
      this.state.update((state) => ({ ...state, loading: false }));
      throw new Error('This action is not available for the current status');
    }

    const updatedTask: TaskDetail = {
      ...task,
      status: nextStatus,
      history: [
        {
          id: `event_${taskId}_${Date.now()}`,
          type: action,
          title: this.actionTitle(action),
          actorName: 'Alex Chen',
          createdAt: new Date().toISOString(),
        },
        ...task.history,
      ],
    };

    this.state.update((state) => ({
      ...state,
      tasks: state.tasks.map((item) => (item.id === taskId ? updatedTask : item)),
      loading: false,
      lastUpdatedAt: new Date().toISOString(),
    }));

    return updatedTask;
  }

  async checkInTask(taskId: string, latitude: number, longitude: number): Promise<TaskDetail> {
    const checkIn: CheckInRecord = {
      id: `checkin_${taskId}_${Date.now()}`,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      actorName: 'Alex Chen',
    };

    return this.updateTask(taskId, (task) => ({
      ...task,
      status: task.status === 'enRoute' ? 'arrived' : task.status,
      checkIns: [checkIn, ...task.checkIns],
      history: [this.createEvent(taskId, 'CHECKED_IN', 'Checked in on site'), ...task.history],
    }));
  }

  async addPhoto(taskId: string, type: PhotoType, note: string): Promise<TaskDetail> {
    const photo: PhotoRecord = {
      id: `photo_${taskId}_${Date.now()}`,
      type,
      note,
      url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=640&q=80',
      status: 'uploaded',
      createdAt: new Date().toISOString(),
      actorName: 'Alex Chen',
    };

    return this.updateTask(taskId, (task) => ({
      ...task,
      photos: [photo, ...task.photos],
      history: [this.createEvent(taskId, 'PHOTO_UPLOADED', 'Photo uploaded', note), ...task.history],
    }));
  }

  async addNote(taskId: string, text: string): Promise<TaskDetail> {
    const note: NoteRecord = {
      id: `note_${taskId}_${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      actorName: 'Alex Chen',
    };

    return this.updateTask(taskId, (task) => ({
      ...task,
      notes: [note, ...task.notes],
      history: [this.createEvent(taskId, 'NOTE_ADDED', 'Note added', text), ...task.history],
    }));
  }

  async submitSignature(taskId: string, customerName: string, confirmationText: string): Promise<TaskDetail> {
    const signature: SignatureRecord = {
      id: `signature_${taskId}_${Date.now()}`,
      customerName,
      confirmationText,
      submittedAt: new Date().toISOString(),
      actorName: 'Alex Chen',
    };

    return this.updateTask(taskId, (task) => ({
      ...task,
      status: 'completed',
      signature,
      history: [
        this.createEvent(taskId, 'CUSTOMER_APPROVED', 'Customer approval captured', customerName),
        ...task.history,
      ],
    }));
  }

  private async updateTask(taskId: string, updater: (task: TaskDetail) => TaskDetail): Promise<TaskDetail> {
    this.state.update((state) => ({ ...state, loading: true }));
    await this.delay(350);

    const task = this.getTask(taskId);

    if (!task) {
      this.state.update((state) => ({ ...state, loading: false }));
      throw new Error('Task not found');
    }

    const updatedTask = updater(task);

    this.state.update((state) => ({
      ...state,
      tasks: state.tasks.map((item) => (item.id === taskId ? updatedTask : item)),
      loading: false,
      lastUpdatedAt: new Date().toISOString(),
    }));

    return updatedTask;
  }

  private nextStatus(currentStatus: TaskStatus, action: TaskAction): TaskStatus | null {
    if (action === 'REPORT_ISSUE' && currentStatus !== 'completed' && currentStatus !== 'exception') {
      return 'exception';
    }

    const transitions: Partial<Record<TaskStatus, Partial<Record<TaskAction, TaskStatus>>>> = {
      pending: { START_TRAVEL: 'enRoute' },
      enRoute: { CHECK_IN: 'arrived' },
      arrived: { START_WORK: 'inProgress' },
      inProgress: { FINISH_WORK: 'pendingConfirm' },
      pendingConfirm: { COMPLETE_WITH_SIGNATURE: 'completed' },
      exception: { RESUME_JOB: 'pending' },
    };

    return transitions[currentStatus]?.[action] ?? null;
  }

  private actionTitle(action: TaskAction): string {
    const titles: Record<TaskAction, string> = {
      START_TRAVEL: 'Travel started',
      CHECK_IN: 'Checked in on site',
      START_WORK: 'Work started',
      FINISH_WORK: 'Work completed',
      COMPLETE_WITH_SIGNATURE: 'Customer approval captured',
      REPORT_ISSUE: 'Exception reported',
      RESUME_JOB: 'Job resumed',
    };

    return titles[action];
  }

  private createEvent(taskId: string, type: string, title: string, note?: string) {
    return {
      id: `event_${taskId}_${Date.now()}`,
      type,
      title,
      actorName: 'Alex Chen',
      createdAt: new Date().toISOString(),
      note,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
