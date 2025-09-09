import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy } from '@angular/core';
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
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="expTitle" (click)="$event.stopPropagation()">
        <header>
          <h3 id="expTitle">{{ exp?.title }} – {{ exp?.company }}</h3>
          <button class="close-btn" (click)="onClose()">Fermer ✕</button>
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
        <div class="actions">
          <button class="button secondary" (click)="onClose()">Fermer</button>
        </div>
      </div>
    </div>
  `,
})
export class ExperienceModalComponent {
  @Input() exp?: Experience;
  @Output() close = new EventEmitter<void>();
  selectedImageIndex = 0;

  onClose() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (!this.exp?.images?.length) return;
    if (ev.key === 'ArrowRight') {
      this.next();
    } else if (ev.key === 'ArrowLeft') {
      this.prev();
    }
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
    if (!this.exp?.images) return;
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.exp.images.length;
  }

  prev() {
    if (!this.exp?.images) return;
    const n = this.exp.images.length;
    this.selectedImageIndex = (this.selectedImageIndex - 1 + n) % n;
  }

}
