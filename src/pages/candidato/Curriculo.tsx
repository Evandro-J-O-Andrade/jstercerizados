import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidate } from '@/contexts/CandidateContext';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { getSupabaseClient } from '@/lib/supabase';
import {
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  FileText,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react';
import { candidateEducationRepository } from '@/repositories/candidate-education.repository';
import { candidateExperiencesRepository } from '@/repositories/candidate-experiences.repository';
import { candidateSkillsRepository } from '@/repositories/candidate-skills.repository';
import { candidateLanguagesRepository } from '@/repositories/candidate-languages.repository';
import { candidateDocumentsRepository } from '@/repositories/candidate-documents.repository';
import { candidateCoursesRepository } from '@/repositories/candidate-courses.repository';
import type {
  CandidateEducation,
  CandidateExperience,
  CandidateSkill,
  CandidateLanguage,
  CandidateCourse,
} from '@/types/domain/candidate';
import { ExperienceDialog } from '@/components/candidate/ExperienceDialog';
import { EducationDialog } from '@/components/candidate/EducationDialog';
import { CourseDialog } from '@/components/candidate/CourseDialog';
import { LanguageDialog } from '@/components/candidate/LanguageDialog';
import { SkillDialog } from '@/components/candidate/SkillDialog';
import { DocumentDialog } from '@/components/candidate/DocumentDialog';

export default function CandidateCurriculo() {
  const { candidate, isLoading, error, refetch } = useCandidate();
  const { addToast } = useToast();

  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const [editingExperience, setEditingExperience] =
    useState<CandidateExperience | null>(null);
  const [editingEducation, setEditingEducation] =
    useState<CandidateEducation | null>(null);
  const [editingCourse, setEditingCourse] = useState<CandidateCourse | null>(
    null,
  );
  const [editingLanguage, setEditingLanguage] =
    useState<CandidateLanguage | null>(null);
  const [editingSkill, setEditingSkill] = useState<CandidateSkill | null>(null);

  const [globalSkills, setGlobalSkills] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: string;
    id: string;
    candidateId: string;
  } | null>(null);

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Carregando currículo...</p>
    );
  }

  const handleDelete = async () => {
    if (!deleteConfirm || !candidate) return;

    try {
      switch (deleteConfirm.type) {
        case 'experience':
          await candidateExperiencesRepository.delete(
            deleteConfirm.id,
            deleteConfirm.candidateId,
          );
          break;
        case 'education':
          await candidateEducationRepository.delete(
            deleteConfirm.id,
            deleteConfirm.candidateId,
          );
          break;
        case 'language':
          await candidateLanguagesRepository.delete(
            deleteConfirm.id,
            deleteConfirm.candidateId,
          );
          break;
        case 'skill':
          await candidateSkillsRepository.delete(
            deleteConfirm.id,
            deleteConfirm.candidateId,
          );
          break;
        case 'document':
          await candidateDocumentsRepository.delete(
            deleteConfirm.id,
            deleteConfirm.candidateId,
          );
          break;
        default:
          break;
      }

      addToast({ type: 'success', message: 'Item removido!' });
      await refetch();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover item. Tente novamente.',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <SEO
        title={`Meu currículo — ${COMPANY.name}`}
        description="Currículo do candidato"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Meu currículo
          </h1>
          <p className="text-muted-foreground mt-1">
            Suas informações profissionais e documentos.
          </p>
        </header>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {!candidate ? (
          <Card className="p-8 text-center">
            <FileText className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="text-foreground font-medium">
              Cadastro de candidato não encontrado
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Conclua seu cadastro para visualizar seu currículo.
            </p>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-foreground text-lg font-semibold">
                    {candidate.person?.full_name ?? 'Candidato'}
                  </h2>
                  {candidate.headline && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {candidate.headline}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <CurriculumSection
              title="Experiências"
              icon={Briefcase}
              emptyText="Nenhuma experiência cadastrada"
              onAdd={() => {
                setEditingExperience(null);
                setExperienceDialogOpen(true);
              }}
            >
              <ul className="space-y-3">
                {candidate.experiences?.map((e) => (
                  <li
                    key={e.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {e.position ?? '—'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {e.company ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingExperience(e);
                          setExperienceDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'experience',
                            id: e.id,
                            candidateId: e.candidate_id,
                          })
                        }
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CurriculumSection>

            <CurriculumSection
              title="Formação"
              icon={GraduationCap}
              emptyText="Nenhuma formação cadastrada"
              onAdd={() => {
                setEditingEducation(null);
                setEducationDialogOpen(true);
              }}
            >
              <ul className="space-y-3">
                {candidate.education?.map((e) => (
                  <li
                    key={e.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {e.course}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {e.institution}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingEducation(e);
                          setEducationDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'education',
                            id: e.id,
                            candidateId: e.candidate_id,
                          })
                        }
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CurriculumSection>

            <CurriculumSection
              title="Cursos"
              icon={Award}
              emptyText="Nenhum curso cadastrado"
              onAdd={() => {
                setEditingCourse(null);
                setCourseDialogOpen(true);
              }}
            >
              <ul className="space-y-3">
                {(candidate.courses ?? []).map((c) => (
                  <li
                    key={c.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {c.name}
                      </p>
                      {c.institution && (
                        <p className="text-muted-foreground text-xs">
                          {c.institution}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCourse(c);
                          setCourseDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'education',
                            id: c.id,
                            candidateId: c.candidate_id,
                          })
                        }
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CurriculumSection>

            <CurriculumSection
              title="Idiomas"
              icon={Languages}
              emptyText="Nenhum idioma cadastrado"
              onAdd={() => {
                setEditingLanguage(null);
                setLanguageDialogOpen(true);
              }}
            >
              <ul className="space-y-3">
                {candidate.languages?.map((l) => (
                  <li
                    key={l.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {l.language}
                      </p>
                      <p className="text-muted-foreground text-xs">{l.level}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingLanguage(l);
                          setLanguageDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'language',
                            id: l.id,
                            candidateId: l.candidate_id,
                          })
                        }
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CurriculumSection>

            <CurriculumSection
              title="Competências"
              icon={Award}
              emptyText="Nenhuma competência cadastrada"
              onAdd={() => {
                setEditingSkill(null);
                setSkillDialogOpen(true);
              }}
            >
              <ul className="space-y-3">
                {candidate.skills?.map((s) => (
                  <li
                    key={s.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {s.name}
                      </p>
                      {s.level && (
                        <p className="text-muted-foreground text-xs">
                          {s.level}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSkill(s);
                          setSkillDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'skill',
                            id: s.id,
                            candidateId: s.candidate_id,
                          })
                        }
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CurriculumSection>

            <CurriculumSection
              title="Documentos"
              icon={FileText}
              emptyText="Nenhum documento enviado"
              onAdd={() => setDocumentDialogOpen(true)}
            >
              <ul className="space-y-2">
                {candidate.documents?.map((d) => (
                  <li
                    key={d.id}
                    className="border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {d.name ?? d.type}
                      </p>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline"
                      >
                        Abrir documento
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDocumentDialogOpen(true)}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'document',
                            id: d.id,
                            candidateId: d.candidate_id,
                          })
                        }
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CurriculumSection>
          </>
        )}
      </div>

      <ExperienceDialog
        open={experienceDialogOpen}
        onOpenChange={setExperienceDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editingExperience) {
            await candidateExperiencesRepository.update(
              editingExperience.id,
              candidate.id,
              data,
            );
          } else {
            await candidateExperiencesRepository.create({
              candidate_id: candidate.id,
              ...data,
            });
          }
          await refetch();
        }}
        initialData={editingExperience}
        onSuccess={() => {
          setEditingExperience(null);
        }}
      />

      <EducationDialog
        open={educationDialogOpen}
        onOpenChange={setEducationDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editingEducation) {
            await candidateEducationRepository.update(
              editingEducation.id,
              candidate.id,
              data,
            );
          } else {
            await candidateEducationRepository.create({
              candidate_id: candidate.id,
              ...data,
            });
          }
          await refetch();
        }}
        initialData={editingEducation}
        onSuccess={() => {
          setEditingEducation(null);
        }}
      />

      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editingCourse) {
            await candidateCoursesRepository.update(
              editingCourse.id,
              candidate.id,
              data,
            );
          } else {
            await candidateCoursesRepository.create({
              candidate_id: candidate.id,
              ...data,
            });
          }
          await refetch();
        }}
        initialData={editingCourse}
        onSuccess={() => {
          setEditingCourse(null);
        }}
      />

      <LanguageDialog
        open={languageDialogOpen}
        onOpenChange={setLanguageDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editingLanguage) {
            await candidateLanguagesRepository.update(
              editingLanguage.id,
              candidate.id,
              data,
            );
          } else {
            await candidateLanguagesRepository.create({
              candidate_id: candidate.id,
              ...data,
            });
          }
          await refetch();
        }}
        initialData={editingLanguage}
        onSuccess={() => {
          setEditingLanguage(null);
        }}
      />

      <SkillDialog
        open={skillDialogOpen}
        onOpenChange={setSkillDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editingSkill) {
            await candidateSkillsRepository.update(
              editingSkill.id,
              candidate.id,
              data,
            );
          } else {
            await candidateSkillsRepository.create({
              candidate_id: candidate.id,
              ...data,
            });
          }
          await refetch();
        }}
        initialData={editingSkill}
        onSuccess={() => {
          setEditingSkill(null);
        }}
      />

      <DocumentDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        onConfirm={async (file) => {
          if (!candidate) return;
          const existing = candidate.documents?.[0];
          if (existing) {
            await candidateDocumentsRepository.update(
              existing.id,
              candidate.id,
              {
                url: URL.createObjectURL(file),
                name: file.name,
                type: 'resume',
              },
            );
          } else {
            await candidateDocumentsRepository.create({
              candidate_id: candidate.id,
              url: URL.createObjectURL(file),
              name: file.name,
              type: 'resume',
            });
          }
          await refetch();
        }}
        onDelete={async () => {
          if (!candidate) return;
          const existing = candidate.documents?.[0];
          if (existing) {
            await candidateDocumentsRepository.delete(
              existing.id,
              candidate.id,
            );
          }
          await refetch();
        }}
        existingDocument={
          candidate?.documents?.[0]
            ? {
                id: candidate.documents[0].id,
                name: candidate.documents[0].name,
                url: candidate.documents[0].url,
              }
            : null
        }
        onSuccess={() => {
          setDocumentDialogOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remover item?"
        message="Essa ação não pode ser desfeita. O item será removido permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

function CurriculumSection({
  title,
  icon: Icon,
  emptyText,
  children,
  onAdd,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyText: string;
  children?: React.ReactNode;
  onAdd?: () => void;
}) {
  const hasContent = !!children;
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="text-muted-foreground h-5 w-5" />
          <h2 className="text-foreground text-base font-semibold">{title}</h2>
        </div>
        {onAdd && (
          <Button variant="ghost" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {hasContent ? (
        children
      ) : (
        <p className="text-muted-foreground text-sm">{emptyText}</p>
      )}
    </Card>
  );
}
