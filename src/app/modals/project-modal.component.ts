import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, inject } from '@angular/core';
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
    .actions.proj-actions { justify-content: space-between; align-items: center; }
    .proj-actions .nav-btn { min-width: 44px; justify-content: center; }
  `],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="projTitle" (click)="$event.stopPropagation()" #modalEl>
        <header>
          <h3 id="projTitle">{{ project?.name }}</h3>
          <button class="close-btn" (click)="onClose()" aria-label="Fermer">✕</button>
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
        <div class="actions proj-actions">
          <button *ngIf="canNavigate" class="button secondary nav-btn" (click)="prev()" aria-label="Précédent">‹</button>
          <button class="button secondary" (click)="onClose()">Fermer</button>
          <button *ngIf="canNavigate" class="button secondary nav-btn" (click)="next()" aria-label="Suivant">›</button>
        </div>
      </div>
    </div>
  `,
})
export class ProjectModalComponent {
  @Input() project?: Project;
  @Input() projects?: Project[];
  @Output() close = new EventEmitter<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('modalEl') modalRef?: ElementRef<HTMLDivElement>;

  onClose() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (!this.canNavigate) return;
    if (ev.key === 'ArrowRight') {
      this.next();
    } else if (ev.key === 'ArrowLeft') {
      this.prev();
    }
  }


  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('couverture_default.webp')) {
      img.src = 'assets/images/projects/couverture_default.webp';
    }
  }

  get canNavigate(): boolean {
    const list = this.navList();
    return list.length > 1 && this.currentIndex(list) !== -1;
  }

  next(): void {
    const list = this.navList();
    const n = list.length;
    const idx = this.currentIndex(list);
    if (n > 1 && idx !== -1) {
      const nextIdx = (idx + 1) % n;
      this.project = list[nextIdx];
      this.cdr.markForCheck();
      this.scrollModalTop();
    }
  }

  prev(): void {
    const list = this.navList();
    const n = list.length;
    const idx = this.currentIndex(list);
    if (n > 1 && idx !== -1) {
      const prevIdx = (idx - 1 + n) % n;
      this.project = list[prevIdx];
      this.cdr.markForCheck();
      this.scrollModalTop();
    }
  }

  private navList(): Project[] {
    const list = Array.isArray(this.projects) ? this.projects : [];
    if (!list?.length) return [];
    // Only navigate if the current project is in the provided list
    const idx = this.currentIndex(list);
    return idx === -1 ? [] : list;
  }

  private currentIndex(list: Project[]): number {
    const id = this.project?.id;
    if (!id) return -1;
    return list.findIndex((p) => p.id === id);
  }

  private scrollModalTop(): void {
    const el = this.modalRef?.nativeElement;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
}


