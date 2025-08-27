import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../models';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="projTitle" (click)="$event.stopPropagation()">
        <header>
          <h3 id="projTitle">{{ project?.name }}</h3>
          <button class="close-btn" (click)="onClose()">Fermer ✕</button>
        </header>
        <div class="content">
          <div class="small">Année : {{ project?.year || '—' }}</div>
          <p>{{ project?.summary }}</p>
          <div class="kv" *ngIf="project?.technologies?.length">
            <span class="chip" *ngFor="let t of project?.technologies">{{ t }}</span>
          </div>
          <ul *ngIf="project?.bullets?.length">
            <li *ngFor="let b of project?.bullets">{{ b }}</li>
          </ul>
          <div class="kv">
            <a class="inline" *ngIf="project?.links?.github" [href]="project?.links?.github" target="_blank">Code source</a>
            <a class="inline" *ngIf="project?.links?.demo" [href]="project?.links?.demo" target="_blank">Démo</a>
          </div>
        </div>
        <div class="actions">
          <button class="button secondary" (click)="onClose()">Fermer</button>
        </div>
      </div>
    </div>
  `,
})
export class ProjectModalComponent {
  @Input() project?: Project;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose();
  }
}


