import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline, refreshOutline } from 'ionicons/icons';

import { PhotoType, TaskDetail } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-media',
  templateUrl: './task-media.page.html',
  styleUrls: ['./task-media.page.scss'],
  imports: [
    DatePipe,
    FormsModule,
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class TaskMediaPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);

  readonly taskId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = this.taskService.loading;
  readonly task = computed<TaskDetail | null>(() => {
    const id = this.taskId();
    return id ? this.taskService.getTask(id) : null;
  });

  photoType: PhotoType = 'progress';
  photoNote = '';
  taskNote = '';

  constructor() {
    addIcons({ cameraOutline, imageOutline, refreshOutline });
  }

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    this.taskId.set(taskId);

    if (!taskId || !this.taskService.getTask(taskId)) {
      this.error.set('Task not found');
    }
  }

  async addPhoto(): Promise<void> {
    const task = this.task();

    if (!task || !this.photoNote.trim()) {
      this.error.set('Add a short photo note before uploading');
      return;
    }

    this.error.set(null);
    await this.taskService.addPhoto(task.id, this.photoType, this.photoNote.trim());
    this.photoNote = '';
  }

  async addNote(): Promise<void> {
    const task = this.task();

    if (!task || !this.taskNote.trim()) {
      this.error.set('Enter a note before saving');
      return;
    }

    this.error.set(null);
    await this.taskService.addNote(task.id, this.taskNote.trim());
    this.taskNote = '';
  }

  retryUpload(): void {
    this.error.set('Retry is not needed for uploaded mock photos');
  }
}
