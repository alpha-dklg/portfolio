import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Education } from '../models';

@Component({
  selector: 'app-education-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="eduTitle" (click)="$event.stopPropagation()" #modalEl>
        <header>
          <h3 id="eduTitle">{{ education?.title }}</h3>
          <button class="close-btn" (click)="onClose()" aria-label="Fermer">✕</button>
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
        <div class="actions proj-actions">
          <button *ngIf="useExternalParcoursNav || canNavigate" class="button secondary nav-btn" (click)="onPrev()" aria-label="Précédent">‹</button>
          <button class="button secondary" (click)="onClose()">Fermer</button>
          <button *ngIf="useExternalParcoursNav || canNavigate" class="button secondary nav-btn" (click)="onNext()" aria-label="Suivant">›</button>
        </div>
      </div>
    </div>
  `,
})
export class EducationModalComponent implements OnChanges {
  @Input() education?: Education;
  @Input() educationItems?: Education[];
  @Input() useExternalParcoursNav: boolean = false;
  @Input() projectNameById?: (id: string) => string;
  @Input() projectTechById?: (id: string) => string[] | undefined;
  @Output() close = new EventEmitter<void>();
  @Output() openProjectRequested = new EventEmitter<string>();
  @Output() prevRequested = new EventEmitter<void>();
  @Output() nextRequested = new EventEmitter<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('modalEl') modalRef?: ElementRef<HTMLDivElement>;

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

  @HostListener('document:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (this.useExternalParcoursNav) {
      if (ev.key === 'ArrowRight') this.onNext();
      else if (ev.key === 'ArrowLeft') this.onPrev();
      return;
    }
    if (!this.canNavigate) return;
    if (ev.key === 'ArrowRight') this.next();
    else if (ev.key === 'ArrowLeft') this.prev();
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

  // Navigation helpers
  get canNavigate(): boolean {
    return (this.educationItems?.length || 0) > 1 && this.indexInList() !== -1;
  }

  private indexInList(): number {
    if (!this.education?.id || !this.educationItems?.length) return -1;
    return this.educationItems.findIndex((e) => e.id === this.education?.id);
  }

  // Button handlers supporting external or internal navigation
  onNext() {
    if (this.useExternalParcoursNav) this.nextRequested.emit();
    else this.next();
  }

  onPrev() {
    if (this.useExternalParcoursNav) this.prevRequested.emit();
    else this.prev();
  }

  private list(): Education[] { return Array.isArray(this.educationItems) ? this.educationItems : []; }

  next() {
    const list = this.list();
    const n = list.length;
    const idx = this.indexInList();
    if (n > 1 && idx !== -1) {
      this.education = list[(idx + 1) % n];
      this.cdr.markForCheck();
      this.scrollModalTop();
    }
  }

  prev() {
    const list = this.list();
    const n = list.length;
    const idx = this.indexInList();
    if (n > 1 && idx !== -1) {
      this.education = list[(idx - 1 + n) % n];
      this.cdr.markForCheck();
      this.scrollModalTop();
    }
  }

  private scrollModalTop(): void {
    const el = this.modalRef?.nativeElement;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['education'] && !changes['education'].firstChange) {
      this.scrollModalTop();
    }
  }
}


