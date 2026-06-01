import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.page.html',
  styleUrls: ['./signature.page.scss'],
  imports: [
    DatePipe,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonInput,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class SignaturePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly taskId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = this.taskService.loading;
  readonly task = signal(this.taskService.getTask(''));
  customerName = '';
  confirmationText = 'I confirm the service has been completed.';

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    this.taskId.set(taskId);
    this.task.set(taskId ? this.taskService.getTask(taskId) : null);

    if (!taskId || !this.task()) {
      this.error.set('Task not found');
    }
  }

  clearApproval(): void {
    this.customerName = '';
    this.confirmationText = '';
    this.error.set(null);
  }

  async submit(): Promise<void> {
    const task = this.task();

    if (!task) {
      return;
    }

    if (!this.customerName.trim()) {
      this.error.set('Customer name is required');
      return;
    }

    if (!this.confirmationText.trim()) {
      this.error.set('Approval confirmation is required');
      return;
    }

    this.error.set(null);
    await this.taskService.submitSignature(task.id, this.customerName.trim(), this.confirmationText.trim());
    await this.router.navigate(['/tasks/detail', task.id]);
  }
}
