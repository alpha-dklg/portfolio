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
}

export interface Education {
  id: string;
  title: string;
  period: string;
  location?: string;
  summary?: string;
  courses?: string[];
  projects?: string[];
  highlights?: string[];
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  location?: string;
  bullets: string[];
  tech?: string[];
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
