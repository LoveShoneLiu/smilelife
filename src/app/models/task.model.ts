export type TaskStatus =
  | 'pending'
  | 'enRoute'
  | 'arrived'
  | 'inProgress'
  | 'pendingConfirm'
  | 'completed'
  | 'exception';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TaskAction =
  | 'START_TRAVEL'
  | 'CHECK_IN'
  | 'START_WORK'
  | 'FINISH_WORK'
  | 'COMPLETE_WITH_SIGNATURE'
  | 'REPORT_ISSUE'
  | 'RESUME_JOB';

export interface TaskSummary {
  id: string;
  title: string;
  taskNumber: string;
  customerName: string;
  address: string;
  scheduleTime: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface TaskEvent {
  id: string;
  type: string;
  title: string;
  actorName: string;
  createdAt: string;
  note?: string;
}

export interface CheckInRecord {
  id: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  actorName: string;
}

export type PhotoType = 'before' | 'progress' | 'after' | 'issue';
export type UploadStatus = 'uploaded' | 'uploading' | 'failed';

export interface PhotoRecord {
  id: string;
  type: PhotoType;
  note: string;
  url: string;
  status: UploadStatus;
  createdAt: string;
  actorName: string;
}

export interface NoteRecord {
  id: string;
  text: string;
  createdAt: string;
  actorName: string;
}

export interface SignatureRecord {
  id: string;
  customerName: string;
  imageDataUrl: string;
  submittedAt: string;
  actorName: string;
}

export interface TaskDetail extends TaskSummary {
  contactName: string;
  contactPhone: string;
  description: string;
  history: TaskEvent[];
  checkIns: CheckInRecord[];
  photos: PhotoRecord[];
  notes: NoteRecord[];
  signature: SignatureRecord | null;
}

export interface TaskStatusMeta {
  label: string;
  tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}
