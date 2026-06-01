import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Geolocation } from '@capacitor/geolocation';
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
import { MapService } from '../../services/map.service';
import { TaskService } from '../../services/task.service';

interface Coordinates {
  latitude: number;
  longitude: number;
}

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
  private readonly mapService = inject(MapService);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly taskId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly locating = signal(false);
  readonly currentPosition = signal<Coordinates | null>(null);
  readonly loading = this.taskService.loading;
  readonly task = computed<TaskDetail | null>(() => {
    const id = this.taskId();
    return id ? this.taskService.getTask(id) : null;
  });
  readonly latestCheckIn = computed(() => this.task()?.checkIns[0] ?? null);
  readonly mapProvider = this.mapService.previewProviderLabel;
  readonly navigationProvider = this.mapService.providerLabel;
  readonly mapPreviewUrl = computed<SafeResourceUrl | null>(() => {
    const task = this.task();
    const checkIn = this.latestCheckIn();

    if (!task) {
      return null;
    }

    return this.mapService.mapPreviewUrl({
      address: task.address,
      latitude: checkIn?.latitude ?? this.currentPosition()?.latitude,
      longitude: checkIn?.longitude ?? this.currentPosition()?.longitude,
    });
  });

  constructor() {
    addIcons({ checkmarkCircleOutline, locationOutline, navigateOutline, timeOutline });
  }

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    this.taskId.set(taskId);

    if (!taskId || !this.taskService.getTask(taskId)) {
      this.error.set('Task not found');
      return;
    }

    void this.loadCurrentPosition();
  }

  async checkIn(): Promise<void> {
    const task = this.task();

    if (!task) {
      return;
    }

    this.error.set(null);

    try {
      const position = this.currentPosition() ?? await this.loadCurrentPosition();
      await this.taskService.checkInTask(task.id, position.latitude, position.longitude);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to check in');
    }
  }

  async openNavigation(): Promise<void> {
    const task = this.task();

    if (!task) {
      return;
    }

    const checkIn = this.latestCheckIn();
    const currentPosition = this.currentPosition();
    await this.mapService.openNavigation({
      address: task.address,
      latitude: checkIn?.latitude ?? currentPosition?.latitude,
      longitude: checkIn?.longitude ?? currentPosition?.longitude,
    });
  }

  async done(): Promise<void> {
    const task = this.task();
    await this.router.navigate(['/tasks/detail', task?.id ?? '']);
  }

  private async loadCurrentPosition(): Promise<Coordinates> {
    this.locating.set(true);

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      this.currentPosition.set(coordinates);
      return coordinates;
    } finally {
      this.locating.set(false);
    }
  }
}
