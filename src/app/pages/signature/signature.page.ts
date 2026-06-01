import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
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
    IonTitle,
    IonToolbar,
  ],
})
export class SignaturePage implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') private readonly signatureCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private drawing = false;
  private hasSignature = false;

  readonly taskId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = this.taskService.loading;
  readonly task = signal(this.taskService.getTask(''));
  customerName = '';

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    this.taskId.set(taskId);
    this.task.set(taskId ? this.taskService.getTask(taskId) : null);

    if (!taskId || !this.task()) {
      this.error.set('Task not found');
    }
  }

  ngAfterViewInit(): void {
    this.resizeCanvas();
  }

  startDrawing(event: PointerEvent): void {
    const context = this.getContext();

    if (!context) {
      return;
    }

    this.drawing = true;
    context.beginPath();
    this.draw(event);
  }

  draw(event: PointerEvent): void {
    const canvas = this.signatureCanvas?.nativeElement;
    const context = this.getContext();

    if (!canvas || !context || !this.drawing) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
    this.hasSignature = true;
  }

  stopDrawing(): void {
    this.drawing = false;
  }

  clearSignature(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    const context = this.getContext();

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    this.hasSignature = false;
  }

  async submit(): Promise<void> {
    const task = this.task();
    const canvas = this.signatureCanvas?.nativeElement;

    if (!task || !canvas) {
      return;
    }

    if (!this.customerName.trim()) {
      this.error.set('Customer name is required');
      return;
    }

    if (!this.hasSignature) {
      this.error.set('Signature is required');
      return;
    }

    this.error.set(null);
    await this.taskService.submitSignature(task.id, this.customerName.trim(), canvas.toDataURL('image/png'));
    await this.router.navigate(['/tasks/detail', task.id]);
  }

  private resizeCanvas(): void {
    const canvas = this.signatureCanvas?.nativeElement;

    if (!canvas) {
      return;
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = 220;
    const context = this.getContext();

    if (context) {
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.strokeStyle = '#17212b';
    }
  }

  private getContext(): CanvasRenderingContext2D | null {
    return this.signatureCanvas?.nativeElement.getContext('2d') ?? null;
  }
}
