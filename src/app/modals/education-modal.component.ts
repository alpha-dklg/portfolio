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
          <ng-container *ngIf="education?.context">
            <h4>Contexte</h4>
            <p>{{ education?.context }}</p>
          </ng-container>
          <ng-container *ngIf="education?.coursesGroups?.length; else simpleCourses">
            <h4>Cours clés</h4>
            <div *ngFor="let g of education?.coursesGroups">
              <h5>{{ g.title }}</h5>
              <div *ngIf="hasBlocks(g)">
                <div *ngFor="let b of blocksOf(g)">
                  <h6 class="small">{{ b.title }}</h6>
                  <ul>
                    <li *ngFor="let it of b.items">{{ it }}</li>
                  </ul>
                </div>
              </div>
              <div *ngIf="!hasBlocks(g) && hasItems(g)">
                <ul>
                  <li *ngFor="let it of itemsOf(g)">{{ it }}</li>
                </ul>
              </div>
            </div>
          </ng-container>
          <ng-template #simpleCourses>
            <h4 *ngIf="education?.courses?.length">Cours clés</h4>
            <ul>
              <li *ngFor="let c of education?.courses">{{ c }}</li>
            </ul>
          </ng-template>
          <h4 *ngIf="education?.projects?.length">Projets associés</h4>
          <ul>
            <li *ngFor="let pid of education?.projects">
              <a class="inline" href="#projects" (click)="onOpenProject(pid); $event.preventDefault()">
                {{ projectNameById ? projectNameById(pid) : pid }}
              </a>
              <span class="small" *ngIf="projectTechById && projectTechById(pid)?.length">
                ({{ projectTechById(pid)?.join(', ') }})
              </span>
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
  @Input() projectTechById?: (id: string) => string[] | undefined;
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

  // Helpers to support both grouped and simple course formats
  hasBlocks(group: any): boolean {
    return Array.isArray(group?.blocks) && group.blocks.length > 0;
  }
  blocksOf(group: any): Array<{ title: string; items: string[] }> {
    return Array.isArray(group?.blocks) ? group.blocks : [];
  }
  hasItems(group: any): boolean {
    return Array.isArray(group?.items) && group.items.length > 0;
  }
  itemsOf(group: any): string[] {
    return Array.isArray(group?.items) ? group.items : [];
  }
}


