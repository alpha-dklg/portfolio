import { Component, EventEmitter, HostListener, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div
        class="modal image-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Photo de profil"
        (click)="$event.stopPropagation()"
      >
        <header>
          <h3>Photo de profil</h3>
          <button class="close-btn" (click)="onClose()">Fermer ✕</button>
        </header>
        <div class="content" style="display: flex; justify-content: center">
          <img
            src="assets/images/id_photo.jpg"
            alt="Photo de profil grand format"
            style="max-width: 100%; height: auto; border-radius: 12px"
          />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .image-modal { width: min(1000px, 96vw); max-height: 94vh; overflow: hidden; }
    .image-modal .content { padding: 0; display: flex; align-items: center; justify-content: center; }
    .image-modal .content img { display: block; max-width: 100%; max-height: calc(94vh - 56px); height: auto; object-fit: contain; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose();
  }
}


