import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Education } from '../models';

@Component({
  selector: 'app-education-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="eduTitle" (click)="$event.stopPropagation()">
        <header>
          <h3 id="eduTitle">{{ education?.title }}</h3>
          <button class="close-btn" (click)="onClose()">Fermer ✕</button>
        </header>
        <div class="content">
          <div class="small">{{ education?.period }} · {{ education?.location }}</div>
          <p *ngIf="education?.summary">{{ education?.summary }}</p>
          <h4 *ngIf="education?.courses?.length">Cours clés</h4>
          <ul>
            <li *ngFor="let c of education?.courses">{{ c }}</li>
          </ul>
          <h4 *ngIf="education?.projects?.length">Projets associés</h4>
          <ul>
            <li *ngFor="let pid of education?.projects">
              <a class="inline" href="#projects" (click)="onOpenProject(pid); $event.preventDefault()">
                {{ projectNameById ? projectNameById(pid) : pid }}
              </a>
            </li>
          </ul>
          <h4 *ngIf="education?.highlights?.length">Points saillants</h4>
          <ul>
            <li *ngFor="let h of education?.highlights">{{ h }}</li>
          </ul>
        </div>
        <div class="actions">
          <button class="button secondary" (click)="onClose()">Fermer</button>
        </div>
      </div>
    </div>
  `,
})
export class EducationModalComponent {
  @Input() education?: Education;
  @Input() projectNameById?: (id: string) => string;
  @Output() close = new EventEmitter<void>();
  @Output() openProjectRequested = new EventEmitter<string>();

  onClose() {
    this.close.emit();
  }

  onOpenProject(projectId: string) {
    this.openProjectRequested.emit(projectId);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose();
  }
}


