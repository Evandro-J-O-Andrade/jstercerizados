import type { Candidate } from '@/types/domain/candidate';

export interface MatchBreakdownItem {
  label: string;
  weight: number;
  score: number;
  maxScore: number;
  percentage: number;
  matched: boolean;
  details: string;
}

export interface MatchResult {
  score: number;
  percentage: number;
  breakdown: MatchBreakdownItem[];
  reasons: MatchReason[];
  algorithm_version: string;
}

export interface MatchReason {
  criterion: string;
  matched: boolean;
  weight: number;
  details: string;
}

export interface JobSkillItem {
  id: string;
  skill_id: string;
  skill_name?: string;
  required: boolean;
  level?: string | null;
}

export interface JobWithSkills {
  id: string;
  title: string;
  slug: string;
  city: string | null;
  state: string | null;
  work_mode: string | null;
  contract_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  seniority: string | null;
  published_at: string | null;
  applications_count: number;
  skills?: JobSkillItem[];
  metadata?: Record<string, unknown> | null;
}

export interface MatchingCandidate {
  headline: string | null;
  salary_expectation_min: number | null;
  salary_expectation_max: number | null;
  skills: MatchingSkill[];
  experiences: MatchingExperience[];
  education: MatchingEducation[];
  locations?: string[] | null;
  contract_types?: string[] | null;
  work_modes?: string[] | null;
  salary_min?: number | null;
  salary_max?: number | null;
  available_from?: string | null;
}

export interface MatchingSkill {
  skill_id: string;
  name?: string;
  level: string | null;
  years_used: number | null;
}

export interface MatchingExperience {
  company: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
}

export interface MatchingEducation {
  institution: string;
  course: string;
  degree: string | null;
}

export function toMatchingCandidate(candidate: Candidate): MatchingCandidate {
  return {
    headline: candidate.headline ?? null,
    salary_expectation_min: candidate.salary_expectation_min ?? null,
    salary_expectation_max: candidate.salary_expectation_max ?? null,
    skills: (candidate.skills || []).map((s) => ({
      skill_id: s.skill_id ?? '',
      level: (s as Record<string, unknown>).level as string | null,
      years_used: (s as Record<string, unknown>).years_used as number | null,
    })),
    experiences: (candidate.experiences || []).map((e) => ({
      company: e.company,
      position: e.position,
      start_date: e.start_date ?? null,
      end_date: e.end_date ?? null,
    })),
    education: (candidate.education || []).map((e) => ({
      institution: e.institution,
      course: e.course,
      degree: e.degree ?? null,
    })),
  };
}

export const MATCH_WEIGHTS = {
  job_title: 25,
  experience: 20,
  skills: 20,
  education: 10,
  location: 10,
  contract_type: 5,
  salary: 5,
  availability: 5,
} as const;

export const ALGORITHM_VERSION = '1.0.0';
