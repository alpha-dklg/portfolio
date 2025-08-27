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

  getSkills(): Observable<SkillGroup[]> {
    return this.http.get<SkillGroup[]>('assets/data/skills.json');
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
