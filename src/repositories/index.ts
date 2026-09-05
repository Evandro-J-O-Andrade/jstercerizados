import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';
import type { Candidate } from '@/types/domain/candidate';

type CandidateDocument = Database['public']['Tables']['candidate_documents']['Row'];
type CandidateDocumentInsert = Database['public']['Tables']['candidate_documents']['Insert'];
type CandidateExperience = Database['public']['Tables']['candidate_experiences']['Row'];
type CandidateExperienceInsert = Database['public']['Tables']['candidate_experiences']['Insert'];
type CandidateEducation = Database['public']['Tables']['candidate_education']['Row'];
type CandidateEducationInsert = Database['public']['Tables']['candidate_education']['Insert'];
type CandidateLanguage = Database['public']['Tables']['candidate_languages']['Row'];
type CandidateLanguageInsert = Database['public']['Tables']['candidate_languages']['Insert'];
type CandidateSkill = Database['public']['Tables']['candidate_skills']['Row'];
type CandidateSkillInsert = Database['public']['Tables']['candidate_skills']['Insert'];

class CandidateDocumentsRepository extends SupabaseRepository {
  async create(input: CandidateDocumentInsert) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_documents')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateDocument;
  }
  async update(id: string, candidateId: string, input: Partial<CandidateDocumentInsert>) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_documents')
      .update(input)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateDocument;
  }
  async delete(id: string, candidateId: string) {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('candidate_documents')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);
    if (error) throw error;
  }
}
export const candidateDocumentsRepository = new CandidateDocumentsRepository();

class CandidateExperiencesRepository extends SupabaseRepository {
  async create(input: CandidateExperienceInsert) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_experiences')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateExperience;
  }
  async update(id: string, candidateId: string, input: Partial<CandidateExperienceInsert>) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_experiences')
      .update(input)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateExperience;
  }
  async delete(id: string, candidateId: string) {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('candidate_experiences')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);
    if (error) throw error;
  }
}
export const candidateExperiencesRepository = new CandidateExperiencesRepository();

class CandidateEducationRepository extends SupabaseRepository {
  async create(input: CandidateEducationInsert) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_education')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateEducation;
  }
  async update(id: string, candidateId: string, input: Partial<CandidateEducationInsert>) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_education')
      .update(input)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateEducation;
  }
  async delete(id: string, candidateId: string) {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('candidate_education')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);
    if (error) throw error;
  }
}
export const candidateEducationRepository = new CandidateEducationRepository();

class CandidateLanguagesRepository extends SupabaseRepository {
  async create(input: CandidateLanguageInsert) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_languages')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateLanguage;
  }
  async update(id: string, candidateId: string, input: Partial<CandidateLanguageInsert>) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_languages')
      .update(input)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateLanguage;
  }
  async delete(id: string, candidateId: string) {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('candidate_languages')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);
    if (error) throw error;
  }
}
export const candidateLanguagesRepository = new CandidateLanguagesRepository();

class CandidateSkillsRepository extends SupabaseRepository {
  async create(input: CandidateSkillInsert) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_skills')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateSkill;
  }
  async update(id: string, candidateId: string, input: Partial<CandidateSkillInsert>) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_skills')
      .update(input)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateSkill;
  }
  async delete(id: string, candidateId: string) {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('candidate_skills')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);
    if (error) throw error;
  }
}
export const candidateSkillsRepository = new CandidateSkillsRepository();

type CandidateCourse = Database['public']['Tables']['candidate_courses']['Row'];
type CandidateCourseInsert = Database['public']['Tables']['candidate_courses']['Insert'];
class CandidateCoursesRepository extends SupabaseRepository {
  async create(input: CandidateCourseInsert) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_courses')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateCourse;
  }
  async update(id: string, candidateId: string, input: Partial<CandidateCourseInsert>) {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidate_courses')
      .update(input)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();
    if (error) throw error;
    return data as CandidateCourse;
  }
  async delete(id: string, candidateId: string) {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('candidate_courses')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);
    if (error) throw error;
  }
}
export const candidateCoursesRepository = new CandidateCoursesRepository();

export { SupabaseRepository };

export type { Candidate };
