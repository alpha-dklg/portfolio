export interface Project {
  id: string;
  name: string;
  year?: string;
  summary: string;
  technologies: string[];
  bullets?: string[];
  links?: { github?: string; demo?: string };
  featured?: boolean;
  grade?: string;
  coverImage?: string;
  demoVideo?: string;
}

export interface Education {
  id: string;
  title: string;
  period: string;
  location?: string;
  summary?: string;
  context?: string;
  courses?: string[];
  coursesGroups?: Array<CourseGroup | SimpleCourseBlock>;
  projects?: string[];
  highlights?: string[];
  mention?: string;
  image?: string;
  images?: string[];
}

export interface CourseGroup {
  title: string;
  blocks: CourseBlock[];
}

export interface CourseBlock {
  title: string;
  items: string[];
}

export interface SimpleCourseBlock {
  title: string;
  items: string[];
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  location?: string;
  summary?: string;
  bullets: string[];
  tech?: string[];
  image?: string;
  images?: string[];
  context?: string;
  missions?: string[];
  results?: string[];
  website?: string;
  demoVideo?: string;
}

export interface SkillItem {
  label: string;
  level?: number;
  iconSvg?: string;
}

export interface SkillGroup {
  title: string;
  items: Array<string | SkillItem>;
}

export interface ContactLink {
  label: string;
  href: string;
}

export interface HeroIntroData {
  titleLines: string[];
  subtitle: string;
  meta: string[];
  lead: string;
  cvHref?: string;
  bannerImage?: string;
}

export interface AboutData {
  title: string;
  paragraphs: string[];
}

// New skills data shape (from updated skills.json)
export interface RawSkillIconRef {
  slug: string;
  pack?: string;
}

export interface SkillEntry {
  label: string;
  level?: string; // e.g., "Bon niveau", "Intermédiaire"
  icon?: RawSkillIconRef;
  details?: string;
}

export interface SkillsViewModel {
  intro?: string;
  entries: SkillEntry[];
  softSkills: string[];
}
