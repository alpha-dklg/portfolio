import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  HostListener,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModalComponent } from './modals/avatar-modal.component';
import { EducationModalComponent } from './modals/education-modal.component';
import { ExperienceModalComponent } from './modals/experience-modal.component';
import { ProjectModalComponent } from './modals/project-modal.component';
import {
  ContactLink,
  Education,
  Experience,
  Project,
  SkillGroup,
  SkillItem,
  HeroIntroData,
  AboutData,
  SkillsViewModel,
} from './models';
import { PortfolioDataService } from './portfolio-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AvatarModalComponent, EducationModalComponent, ExperienceModalComponent, ProjectModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  featuredProjects: Project[] = [];
  education: Education[] = [];
  experience: Experience[] = [];
  timelineItems: Array<{
    type: 'experience' | 'education';
    title: string;
    company?: string;
    period: string;
    location?: string;
    bullets?: string[];
    tech?: string[];
    refId?: string;
    image?: string;
    images?: string[];
    summary?: string;
    mention?: string;
    sortTime: number;
  }> = [];
  skills: SkillGroup[] = [];
  skillsVM?: SkillsViewModel;
  contacts: ContactLink[] = [];
  hero?: HeroIntroData;
  about?: AboutData;
  isNavOpen = false;
  showScrollTop = false;
  bannerBackground: string =
    "linear-gradient(rgba(15,23,42,.35), rgba(15,23,42,.35)), url('assets/images/img_banniere.png')";

  selectedEducation?: Education;
  selectedProject?: Project;
  selectedExperience?: Experience;
  showAvatarModal = false;
  activeSectionId?: string;
  isAtTop = true;
  private readonly heroBgThreshold = 80;
  readonly defaultParcoursImage = 'assets/images/img_banniere.png';

  // Parcours filters/sorting
  parcoursFilter: 'all' | 'education' | 'experience' = 'all';
  parcoursSort: 'asc' | 'desc' = 'desc';
  carouselIndex: Record<string, number> = {};
  private autoScrollIntervalId?: any;

  get currentYear(): number {
    return new Date().getFullYear();
  }

  private readonly dataService = inject(PortfolioDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.dataService.getHeroIntro().subscribe((data) => {
      this.hero = data;
      this.cdr.markForCheck();
      if (data.bannerImage) {
        this.bannerBackground = `linear-gradient(rgba(15,23,42,.35), rgba(15,23,42,.35)), url('${data.bannerImage}')`;
      }
    });
    this.dataService.getProjects().subscribe((projects) => {
      this.projects = projects;
      this.featuredProjects = projects.filter((p) => Boolean(p.featured));
      this.cdr.markForCheck();
      setTimeout(() => this.setupProjectCardsObserver());
    });
    this.dataService.getAbout().subscribe((data) => {
      this.about = data;
      this.cdr.markForCheck();
    });
    this.dataService.getEducation().subscribe((items) => {
      this.education = items;
      this.rebuildTimeline();
      this.cdr.markForCheck();
      setTimeout(() => this.setupRevealObserver());
      this.startCarouselAuto();
    });
    this.dataService.getExperience().subscribe((items) => {
      this.experience = items;
      this.rebuildTimeline();
      this.cdr.markForCheck();
      setTimeout(() => this.setupRevealObserver());
      this.startCarouselAuto();
    });
    // Keep legacy load to not break anything else
    this.dataService.getSkills().subscribe((items) => {
      this.skills = items;
      this.cdr.markForCheck();
    });
    // New unified skills view model for rendering
    this.dataService.getSkillsViewModel().subscribe((vm) => {
      this.skillsVM = vm;
      this.cdr.markForCheck();
      setTimeout(() => this.setupSoftSkillsObserver());
    });
    this.dataService.getContacts().subscribe((items) => {
      this.contacts = items;
      this.cdr.markForCheck();
    });
    setTimeout(() => this.setupRevealObserver());
    setTimeout(() => this.observeSections());
    this.isAtTop = window.scrollY <= this.heroBgThreshold;
  }

  ngOnDestroy(): void {
    this.stopCarouselAuto();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModals();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const threshold = 300;
    this.showScrollTop = window.scrollY > threshold;
    this.isAtTop = window.scrollY <= this.heroBgThreshold;
    this.cdr.markForCheck();

    const firstHeading = document.querySelector('section[id] h2') as HTMLElement | null;
    if (firstHeading) {
      const rect = firstHeading.getBoundingClientRect();
      if (rect.top >= window.innerHeight - 1) {
        if (this.activeSectionId) {
          this.activeSectionId = undefined;
          this.cdr.markForCheck();
        }
      }
    }
  }

  openEducation(id: string) {
    this.selectedEducation = this.education.find((e) => e.id === id);
  }
  openProject(id: string) {
    this.selectedProject = this.projects.find((p) => p.id === id);
  }
  openExperience(title: string, company: string) {
    this.selectedExperience = this.experience.find((e) => e.title === title && e.company === company);
  }

  onParcoursItemClick(item: any) {
    if (item.type === 'education' && item.refId) {
      this.openEducation(item.refId);
    } else if (item.type === 'experience') {
      this.openExperience(item.title, item.company || '');
    }
  }
  closeModals() {
    this.selectedEducation = undefined;
    this.selectedProject = undefined;
    this.isNavOpen = false;
  }
  openAvatar() {
    this.showAvatarModal = true;
    this.cdr.markForCheck();
  }
  closeAvatar() {
    this.showAvatarModal = false;
    this.cdr.markForCheck();
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
    this.cdr.markForCheck();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get linkedinHref(): string | undefined {
    return this.contacts.find((c) => /linkedin/i.test(c.label))?.href;
  }

  get githubHref(): string | undefined {
    return this.contacts.find((c) => /github/i.test(c.label))?.href;
  }

  get gitlabHref(): string | undefined {
    return this.contacts.find((c) => /gitlab/i.test(c.label))?.href;
  }

  projectNameById(id: string): string {
    const project = this.projects.find((p) => p.id === id);
    return project?.name ?? id;
  }

  projectTechById(id: string): string[] | undefined {
    return this.projects.find((p) => p.id === id)?.technologies;
  }

  trackById(_: number, item: any) {
    return item.id || item.name || item.title;
  }

  isSkillItem(item: any): item is SkillItem {
    return item && typeof item === 'object' && 'label' in item;
  }

  get softSkills(): string[] {
    const group = this.skills.find((g) => /soft/i.test(g.title));
    if (!group) return [];
    return (group.items as any[]).filter((x) => typeof x === 'string') as string[];
  }

  isSoftSkillsGroup(group: SkillGroup): boolean {
    return /soft/i.test(group.title);
  }

  contactType(link: ContactLink): 'email' | 'phone' | 'linkedin' | 'github' | 'gitlab' | 'link' {
    const label = link.label.toLowerCase();
    const href = link.href.toLowerCase();
    if (href.startsWith('mailto:') || /mail|email/.test(label)) return 'email';
    if (href.startsWith('tel:') || /téléphone|telephone|phone/.test(label)) return 'phone';
    if (/linkedin/.test(label) || /linkedin/.test(href)) return 'linkedin';
    if (/github/.test(label) || /github/.test(href)) return 'github';
    if (/gitlab/.test(label) || /gitlab/.test(href)) return 'gitlab';
    return 'link';
  }

  private setupRevealObserver(): void {
    if (typeof window === 'undefined') return;
    const elements = Array.from(document.querySelectorAll('.reveal')) as HTMLElement[];
    if (!elements.length) return;
    const supportsIO = 'IntersectionObserver' in window;
    if (!supportsIO) {
      elements.forEach((el) => el.classList.add('reveal-in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('reveal-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
  }

  private observeSections(): void {
    if (typeof window === 'undefined') return;
    const headings = Array.from(document.querySelectorAll('section[id] h2')) as HTMLElement[];
    if (!headings.length || !(window as any).IntersectionObserver) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionEl = (entry.target as HTMLElement).closest(
              'section[id]'
            ) as HTMLElement | null;
            if (sectionEl) {
              this.activeSectionId = sectionEl.id;
            }
            this.cdr.markForCheck();
          }
        });
      },
      { rootMargin: '0px 0px 0px 0px', threshold: 0 }
    );
    headings.forEach((el) => observer.observe(el));
  }

  private setupSoftSkillsObserver(): void {
    if (typeof window === 'undefined') return;
    const container = document.querySelector('.softskills') as HTMLElement | null;
    if (!container) return;
    const reveal = () => container.classList.add('softskills-in');
    const supportsIO = 'IntersectionObserver' in window;
    if (!supportsIO) {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(container);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('couverture_default.webp')) {
      img.src = 'assets/images/projects/couverture_default.webp';
    }
  }

  private setupProjectCardsObserver(): void {
    if (typeof window === 'undefined') return;
    const container = document.querySelector('.project-cards') as HTMLElement | null;
    if (!container) return;
    const reveal = () => container.classList.add('project-cards-in');
    const supportsIO = 'IntersectionObserver' in window;
    if (!supportsIO) {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(container);
  }

  skillIconKey(label: string): string {
    const l = label.toLowerCase();
    if (/angular/.test(l)) return 'angular';
    if (/java\b/.test(l) && !/javascript/.test(l)) return 'java';
    if (/(langage|language).*programm|paradigm|paradigme/.test(l)) return 'code';
    if (/(mysql|postgres|mongo|sql|nosql|base de donn|base de don|database)/.test(l)) return 'database';
    if (/docker/.test(l)) return 'docker';
    if (/aws|amazon web services|amazonwebservices/.test(l)) return 'aws';
    if (/(méthodologies|methodologies|qualité|quality|agile|scrum|tdd|uml)/.test(l)) return 'method';
    if (/(outils|environnements|tools|visual studio code|vscode|ide|intellij)/.test(l)) return 'tools';
    return 'generic';
  }

  skillLevelPercent(level?: string): number {
    if (!level) return 60;
    const l = level.toLowerCase();
    if (/confirmé/.test(l) && /intermédiaire/.test(l)) return 75;
    if (/confirmé/.test(l)) return 90;
    if (/bon\s*niveau/.test(l)) return 70;
    if (/intermédiaire/.test(l)) return 55;
    if (/débutant|beginner/.test(l)) return 30;
    return 60;
  }

  private rebuildTimeline(): void {
    const items: Array<{
      type: 'experience' | 'education';
      title: string;
      company?: string;
      period: string;
      location?: string;
      bullets?: string[];
      tech?: string[];
      refId?: string;
      image?: string;
      images?: string[];
      summary?: string;
      mention?: string;
      sortTime: number;
    }> = [];
    if (this.experience?.length) {
      for (const x of this.experience) {
        items.push({
          type: 'experience',
          title: x.title,
          company: x.company,
          period: x.period,
          location: x.location,
          bullets: x.bullets,
          tech: x.tech,
          image: (x as any).image,
          sortTime: this.parsePeriodToSortValue(x.period),
        });
      }
    }
    if (this.education?.length) {
      for (const e of this.education) {
        items.push({
          type: 'education',
          title: e.title,
          period: e.period,
          location: e.location,
          refId: e.id,
          summary: e.summary,
          image: (e as any).image,
          images: (e as any).images,
          mention: this.extractMention(e),
          sortTime: this.parsePeriodToSortValue(e.period),
        });
      }
    }
    items.sort((a, b) => b.sortTime - a.sortTime);
    this.timelineItems = items;
    this.cdr.markForCheck();
    this.startCarouselAuto();
  }

  private parsePeriodToSortValue(period: string): number {
    if (!period) return 0;
    const normalized = period.replace(/\s*[–-]\s*/g, ' – ');
    const parts = normalized.split(' – ');
    const right = (parts[1] || parts[0]).trim();
    if (/present|en cours|now/i.test(right)) return Number.MAX_SAFE_INTEGER;
    const m1 = right.match(/^(0?[1-9]|1[0-2])[\/.-](\d{4})$/);
    if (m1) {
      const month = parseInt(m1[1], 10);
      const year = parseInt(m1[2], 10);
      return year * 12 + month;
    }
    const m2 = right.match(/^(\d{4})$/);
    if (m2) {
      const year = parseInt(m2[1], 10);
      return year * 12 + 12;
    }
    const m3 = right.match(/^(\d{4})[\/-](0?[1-9]|1[0-2])$/);
    if (m3) {
      const year = parseInt(m3[1], 10);
      const month = parseInt(m3[2], 10);
      return year * 12 + month;
    }
    const mYear = right.match(/(\d{4})/);
    if (mYear) {
      const year = parseInt(mYear[1], 10);
      return year * 12 + 12;
    }
    return 0;
  }

  private extractMention(edu: Education): string | undefined {
    if (edu.mention !== undefined) {
      return edu.mention || undefined;
    }
    const fromHighlights = edu.highlights?.find((h) => /mention/i.test(h));
    if (fromHighlights) return fromHighlights;
    if (edu.summary) {
      const m = edu.summary.match(/mention\s*:\s*([^.;,]+)/i);
      if (m && m[1]) return `Mention : ${m[1].trim()}`;
    }
    return undefined;
  }

  // Computed filtered/sorted list for parcours view
  get filteredSortedTimeline() {
    let list = this.timelineItems;
    if (this.parcoursFilter !== 'all') {
      list = list.filter((x) => x.type === this.parcoursFilter);
    }
    const sorted = [...list].sort((a, b) =>
      this.parcoursSort === 'desc' ? b.sortTime - a.sortTime : a.sortTime - b.sortTime
    );
    return sorted;
  }

  setParcoursFilter(filter: 'all' | 'education' | 'experience') {
    this.parcoursFilter = filter;
    this.cdr.markForCheck();
    setTimeout(() => this.setupRevealObserver());
    this.startCarouselAuto();
  }

  setParcoursSort(order: 'asc' | 'desc') {
    this.parcoursSort = order;
    this.cdr.markForCheck();
    setTimeout(() => this.setupRevealObserver());
    this.startCarouselAuto();
  }

  // Simple carousel controls (auto-scroll every 4s)
  nextCarousel(key: string, total: number) {
    const current = this.carouselIndex[key] || 0;
    this.carouselIndex[key] = (current + 1) % total;
    this.cdr.markForCheck();
  }
  prevCarousel(key: string, total: number) {
    const current = this.carouselIndex[key] || 0;
    this.carouselIndex[key] = (current - 1 + total) % total;
    this.cdr.markForCheck();
  }

  carouselKey(item: { type: 'experience' | 'education'; title: string }): string {
    return `${item.type}:${item.title}`;
  }

  private startCarouselAuto(): void {
    this.stopCarouselAuto();
    this.autoScrollIntervalId = setInterval(() => {
      const list = this.filteredSortedTimeline;
      for (const it of list) {
        const total = it.images?.length || 0;
        if (total > 1) this.nextCarousel(this.carouselKey(it), total);
      }
    }, 2000);
  }

  private stopCarouselAuto(): void {
    if (this.autoScrollIntervalId) {
      clearInterval(this.autoScrollIntervalId);
      this.autoScrollIntervalId = undefined;
    }
  }
}
