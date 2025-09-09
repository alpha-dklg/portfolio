import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../models';
import { VideoEmbedComponent } from '../video-embed.component';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, VideoEmbedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .project-cover-modal {
      margin: 1rem 0;
      text-align: center;
    }
    .project-cover-modal img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  `],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="projTitle" (click)="$event.stopPropagation()">
        <header>
          <h3 id="projTitle">{{ project?.name }}</h3>
          <button class="close-btn" (click)="onClose()">Fermer ✕</button>
        </header>
        <div class="content">
          <div class="small">Année : {{ project?.year || '—' }}</div>
          <div class="project-cover-modal">
            <img [src]="project?.coverImage || 'assets/images/projects/couverture_default.webp'" [alt]="project?.name" (error)="onImageError($event)" />
          </div>
          <p>{{ project?.summary }}</p>
          <div class="kv" *ngIf="project?.technologies?.length">
            <span class="chip" *ngFor="let t of project?.technologies">{{ t }}</span>
          </div>
          <ul *ngIf="project?.bullets?.length">
            <li *ngFor="let b of project?.bullets">{{ b }}</li>
          </ul>
          <ng-container *ngIf="project?.demoVideo">
            <h4>Démonstration</h4>
            <app-video-embed 
              [videoId]="project?.demoVideo" 
              [title]="project?.name + ' – Démonstration'">
            </app-video-embed>
          </ng-container>
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


  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('couverture_default.webp')) {
      img.src = 'assets/images/projects/couverture_default.webp';
    }
  }
}


