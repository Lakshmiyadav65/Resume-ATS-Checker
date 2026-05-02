export interface TailoredContact {
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

export interface TailoredEducation {
  degree: string;
  school: string;
  dates?: string;
  details?: string;
}

export interface TailoredProject {
  title: string;
  bullets: string[];
}

export interface TailoredExperience {
  title: string;
  company: string;
  dates?: string;
  bullets: string[];
}

export interface TailoredResume {
  name: string;
  contact: TailoredContact;
  summary?: string;
  skills: string[];
  education: TailoredEducation[];
  projects: TailoredProject[];
  experience: TailoredExperience[];
}

export interface TailorRequest {
  resume: string;
  jd: string;
}
