import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Experience } from '../models';
import { VideoEmbedComponent } from '../video-embed.component';

@Component({
  selector: 'app-experience-modal',
  standalone: true,
  imports: [CommonModule, VideoEmbedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
  `],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="expTitle" (click)="$event.stopPropagation()" #modalEl>
        <header>
          <h3 id="expTitle">{{ exp?.title }} – {{ exp?.company }}</h3>
          <button class="close-btn" (click)="onClose()" aria-label="Fermer">✕</button>
        </header>
                 <div class="content">
          <div class="small">📍 {{ exp?.location || '—' }} — {{ exp?.period }}</div>
          <p *ngIf="exp?.summary">{{ exp?.summary }}</p>
          <div class="kv" *ngIf="exp?.tech?.length">
            <span class="chip" *ngFor="let t of exp?.tech">{{ t }}</span>
          </div>
          <ng-container *ngIf="exp?.context">
            <h4>Contexte</h4>
            <p>{{ exp?.context }}</p>
          </ng-container>
          <ng-container *ngIf="exp?.missions?.length">
            <h4>Missions</h4>
            <ul>
              <li *ngFor="let m of exp?.missions">{{ m }}</li>
            </ul>
          </ng-container>
          <ng-container *ngIf="exp?.results?.length">
            <h4>Résultats & apports</h4>
            <ul>
              <li *ngFor="let r of exp?.results">{{ r }}</li>
            </ul>
          </ng-container>
          <div class="kv" *ngIf="exp?.website">
            <a class="inline" [href]="exp?.website" target="_blank" rel="noopener">Visiter le site</a>
          </div>
          <ng-container *ngIf="exp?.demoVideo">
            <h4>Démonstration</h4>
            <app-video-embed 
              [videoId]="exp?.demoVideo" 
              [title]="exp?.title + ' – Démonstration'">
            </app-video-embed>
          </ng-container>
        </div>
        <div class="actions proj-actions">
          <button *ngIf="useExternalParcoursNav || canNavigate" class="button secondary nav-btn" (click)="onPrev()" aria-label="Précédent">‹</button>
          <button class="button secondary" (click)="onClose()">Fermer</button>
          <button *ngIf="useExternalParcoursNav || canNavigate" class="button secondary nav-btn" (click)="onNext()" aria-label="Suivant">›</button>
        </div>
      </div>
    </div>
  `,
})
export class ExperienceModalComponent implements OnChanges {
  @Input() exp?: Experience;
  @Input() experienceItems?: Experience[];
  @Input() useExternalParcoursNav: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() prevRequested = new EventEmitter<void>();
  @Output() nextRequested = new EventEmitter<void>();
  selectedImageIndex = 0;
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
    if (this.useExternalParcoursNav) {
      if (ev.key === 'ArrowRight') this.onNext();
      else if (ev.key === 'ArrowLeft') this.onPrev();
      return;
    }
    if (ev.key === 'ArrowRight') this.next();
    else if (ev.key === 'ArrowLeft') this.prev();
  }

  selectImage(i: number) {
    this.selectedImageIndex = i;
  }

  get currentImageSrc(): string | undefined {
    const imgs = this.exp?.images;
    if (!imgs || !imgs.length) return undefined;
    const idx = Math.max(0, Math.min(this.selectedImageIndex, imgs.length - 1));
    return imgs[idx];
  }

  next() {
    // Prefer navigating among experience items if provided; otherwise fallback to image gallery nav.
    if (this.canNavigate) {
      const list = this.list();
      const n = list.length;
      const idx = this.indexInList();
      if (n > 1 && idx !== -1) {
        this.exp = list[(idx + 1) % n];
        this.selectedImageIndex = 0;
        this.cdr.markForCheck();
        this.scrollModalTop();
        return;
      }
    }
    if (this.exp?.images?.length) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.exp.images.length;
    }
  }

  prev() {
    if (this.canNavigate) {
      const list = this.list();
      const n = list.length;
      const idx = this.indexInList();
      if (n > 1 && idx !== -1) {
        this.exp = list[(idx - 1 + n) % n];
        this.selectedImageIndex = 0;
        this.cdr.markForCheck();
        this.scrollModalTop();
        return;
      }
    }
    if (this.exp?.images?.length) {
      const n = this.exp.images.length;
      this.selectedImageIndex = (this.selectedImageIndex - 1 + n) % n;
    }
  }

  // Navigation among experiences
  get canNavigate(): boolean {
    return (this.experienceItems?.length || 0) > 1 && this.indexInList() !== -1;
  }
  private indexInList(): number {
    if (!this.exp || !this.experienceItems?.length) return -1;
    return this.experienceItems.findIndex((e) => e.title === this.exp?.title && e.company === this.exp?.company);
  }
  private list(): Experience[] { return Array.isArray(this.experienceItems) ? this.experienceItems : []; }

  // Button handlers supporting external or internal navigation
  onNext() {
    if (this.useExternalParcoursNav) this.nextRequested.emit();
    else this.next();
  }
  onPrev() {
    if (this.useExternalParcoursNav) this.prevRequested.emit();
    else this.prev();
  }

  private scrollModalTop(): void {
    const el = this.modalRef?.nativeElement;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exp'] && !changes['exp'].firstChange) {
      this.scrollModalTop();
    }
  }

}
