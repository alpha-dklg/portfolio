import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ContactLink,
  Education,
  Experience,
  Project,
  SkillGroup,
  HeroIntroData,
  AboutData,
  SkillsViewModel,
  SkillEntry,
} from './models';

@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  private readonly http = inject(HttpClient);

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('assets/data/projects.json');
  }

  getEducation(): Observable<Education[]> {
    return this.http.get<Education[]>('assets/data/education.json');
  }

  getExperience(): Observable<Experience[]> {
    return this.http.get<Experience[]>('assets/data/experience.json');
  }

  // Legacy signature kept for compatibility if needed elsewhere
  getSkills(): Observable<SkillGroup[]> {
    return this.http.get<SkillGroup[]>('assets/data/skills.json');
  }

  // New unified view model for the Skills section
  getSkillsViewModel(): Observable<SkillsViewModel> {
    return this.http.get<any[]>('assets/data/skills.json').pipe(
      map((raw) => {
        const intro = typeof raw[0]?.intro === 'string' ? raw[0].intro : undefined;
        const softBlock = raw.find((x) => typeof x?.title === 'string' && /soft/i.test(x.title));
        const softSkills: string[] = Array.isArray(softBlock?.items)
          ? softBlock.items.filter((v: any) => typeof v === 'string')
          : [];

        const entries: SkillEntry[] = raw
          .filter((x) => x && typeof x.label === 'string')
          .map((x) => ({
            label: x.label,
            level: x.level,
            icon: x.icon,
            details: x.details,
          }));

        return { intro, entries, softSkills } as SkillsViewModel;
      })
    );
  }

  getContacts(): Observable<ContactLink[]> {
    return this.http.get<ContactLink[]>('assets/data/contacts.json');
  }

  getHeroIntro(): Observable<HeroIntroData> {
    return this.http.get<HeroIntroData>('assets/data/intro.json');
  }

  getFeaturedProjects(): Observable<Project[]> {
    return this.getProjects().pipe(map((projects) => projects.filter((p) => Boolean(p.featured))));
  }

  getAbout(): Observable<AboutData> {
    return this.http.get<AboutData>('assets/data/about.json');
  }
}
