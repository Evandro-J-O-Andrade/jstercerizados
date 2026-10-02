import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/contexts/CandidateContext', () => ({
  useCandidate: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

vi.mock('@/components/ui/SEO', () => ({
  SEO: ({ title }: { title: string }) => (
    <div data-testid="seo" data-title={title} />
  ),
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/feedback/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock('@/components/feedback/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    onConfirm,
    onCancel,
    title,
    message,
  }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const iconComponents: Record<string, any> = {};
[
  'Briefcase',
  'GraduationCap',
  'Award',
  'Languages',
  'FileText',
  'Building2',
  'Plus',
  'Pencil',
  'Trash2',
  'Upload',
].forEach((name) => {
  iconComponents[name] = ({ className }: any) => (
    <svg data-icon={name} className={className} data-testid={`icon-${name}`} />
  );
});

vi.mock('lucide-react', () => {
  const iconComponents: Record<string, any> = {};
  [
    'Briefcase',
    'GraduationCap',
    'Award',
    'Languages',
    'FileText',
    'Building2',
    'Plus',
    'Pencil',
    'Trash2',
    'Upload',
  ].forEach((name) => {
    iconComponents[name] = ({ className }: any) => (
      <svg
        data-icon={name}
        className={className}
        data-testid={`icon-${name}`}
      />
    );
  });
  return iconComponents;
});

vi.mock('@/features/candidato/components/candidate/ExperienceDialog', () => ({
  ExperienceDialog: ({ open, onOpenChange, onConfirm }: any) =>
    open ? (
      <div data-testid="experience-dialog">
        <button
          onClick={() =>
            onConfirm({ company: 'Empresa X', position: 'Cargo X' })
          }
        >
          Submit Experience
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/features/candidato/components/candidate/EducationDialog', () => ({
  EducationDialog: ({ open, onOpenChange, onConfirm }: any) =>
    open ? (
      <div data-testid="education-dialog">
        <button
          onClick={() =>
            onConfirm({ institution: 'USP', course: 'Engenharia' })
          }
        >
          Submit Education
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/features/candidato/components/candidate/CourseDialog', () => ({
  CourseDialog: ({ open, onOpenChange, onConfirm }: any) =>
    open ? (
      <div data-testid="course-dialog">
        <button
          onClick={() => onConfirm({ name: 'Curso X', institution: 'Inst' })}
        >
          Submit Course
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/features/candidato/components/candidate/LanguageDialog', () => ({
  LanguageDialog: ({ open, onOpenChange, onConfirm }: any) =>
    open ? (
      <div data-testid="language-dialog">
        <button
          onClick={() => onConfirm({ language: 'Inglês', level: 'Avançado' })}
        >
          Submit Language
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/features/candidato/components/candidate/SkillDialog', () => ({
  SkillDialog: ({ open, onOpenChange, onConfirm }: any) =>
    open ? (
      <div data-testid="skill-dialog">
        <button onClick={() => onConfirm({ name: 'React', level: 'Avançado' })}>
          Submit Skill
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/features/candidato/components/candidate/DocumentDialog', () => ({
  DocumentDialog: ({ open, onOpenChange, onConfirm, onDelete }: any) =>
    open ? (
      <div data-testid="document-dialog">
        <button
          onClick={() => onConfirm({ url: 'http://test.com', name: 'doc.pdf' })}
        >
          Submit Document
        </button>
        <button onClick={onDelete}>Delete Document</button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/features/candidato/components/candidate/PreferencesDialog', () => ({
  PreferencesDialog: ({ open, onOpenChange, onConfirm }: any) =>
    open ? (
      <div data-testid="preferences-dialog">
        <button
          onClick={() =>
            onConfirm({ desired_roles: ['Analista'], contract_types: ['clt'] })
          }
        >
          Submit Preferences
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/repositories/candidates.repository', () => ({
  candidatesRepository: {
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-experiences.repository', () => ({
  candidateExperiencesRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/repositories/candidate-education.repository', () => ({
  candidateEducationRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/repositories/candidate-courses.repository', () => ({
  candidateCoursesRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/repositories/candidate-languages.repository', () => ({
  candidateLanguagesRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/repositories/candidate-skills.repository', () => ({
  candidateSkillsRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/repositories/candidate-documents.repository', () => ({
  candidateDocumentsRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@/repositories/candidate-preferences.repository', () => ({
  candidatePreferencesRepository: { create: vi.fn(), update: vi.fn() },
}));

vi.mock('@/config', () => ({
  COMPANY: { name: 'J&S Empregos LTDA' },
}));

import { useAuth } from '@/contexts/AuthContext';
import { useCandidate } from '@/contexts/CandidateContext';
import { candidateExperiencesRepository } from '@/repositories/candidate-experiences.repository';
import { candidateEducationRepository } from '@/repositories/candidate-education.repository';
import { candidateSkillsRepository } from '@/repositories/candidate-skills.repository';
import { candidateDocumentsRepository } from '@/repositories/candidate-documents.repository';
import CandidateCurriculo from '@/features/candidato/pages/Curriculo';

const mockUseAuth = vi.mocked(useAuth);
const mockUseCandidate = vi.mocked(useCandidate);

function makeCandidate(
  experiences: any[] = [],
  education: any[] = [],
  courses: any[] = [],
  languages: any[] = [],
  skills: any[] = [],
  documents: any[] = [],
) {
  return {
    id: 'c1',
    person_id: 'p1',
    tenant_id: 't1',
    person: { full_name: 'João Silva' },
    headline: 'Desenvolvedor Full Stack',
    status: 'active',
    skills,
    experiences,
    education,
    courses,
    languages,
    documents,
  };
}

function findDeleteButtonForItem(itemText: string) {
  const trashIcons = screen.getAllByTestId('icon-Trash2');
  for (const icon of trashIcons) {
    const trashBtn = icon.closest('button');
    if (trashBtn) {
      const li = trashBtn.closest('li');
      if (li && li.textContent && li.textContent.includes(itemText)) {
        return trashBtn;
      }
    }
  }
  throw new Error(`Delete button for "${itemText}" not found`);
}

describe('CandidateCurriculo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'João Silva' } as never,
      updateProfile: vi.fn(),
    } as never);
  });

  it('renders loading state', () => {
    mockUseCandidate.mockReturnValue({
      candidate: null,
      preferences: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    expect(screen.getByText('Carregando currículo...')).toBeInTheDocument();
  });

  it('renders "not found" card when candidate does not exist', () => {
    mockUseCandidate.mockReturnValue({
      candidate: null,
      preferences: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Cadastro de candidato não encontrado'),
    ).toBeInTheDocument();
  });

  it('renders all curriculum sections when candidate has data', () => {
    const candidate = makeCandidate(
      [
        {
          id: 'exp1',
          company: 'Empresa A',
          position: 'Operador',
          candidate_id: 'c1',
        },
      ],
      [
        {
          id: 'edu1',
          institution: 'USP',
          course: 'Engenharia',
          candidate_id: 'c1',
        },
      ],
      [{ id: 'c1', name: 'Curso X', institution: 'Inst', candidate_id: 'c1' }],
      [{ id: 'l1', language: 'Inglês', level: 'Avançado', candidate_id: 'c1' }],
      [{ id: 's1', name: 'React', level: 'Avançado', candidate_id: 'c1' }],
      [
        {
          id: 'd1',
          name: 'CV.pdf',
          type: 'resume',
          url: 'http://test.com/cv.pdf',
          candidate_id: 'c1',
        },
      ],
    );

    mockUseCandidate.mockReturnValue({
      candidate,
      preferences: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    expect(screen.getByText('Experiências')).toBeInTheDocument();
    expect(screen.getByText('Formação')).toBeInTheDocument();
    expect(screen.getByText('Cursos')).toBeInTheDocument();
    expect(screen.getByText('Idiomas')).toBeInTheDocument();
    expect(screen.getByText('Competências')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Preferências')).toBeInTheDocument();
  });

  it('renders experience items with position and company', () => {
    const candidate = makeCandidate([
      {
        id: 'exp1',
        company: 'Empresa A',
        position: 'Operador',
        candidate_id: 'c1',
      },
      {
        id: 'exp2',
        company: 'Empresa B',
        position: 'Zelador',
        candidate_id: 'c1',
      },
    ]);

    mockUseCandidate.mockReturnValue({
      candidate,
      preferences: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    expect(screen.getByText('Operador')).toBeInTheDocument();
    expect(screen.getByText('Empresa A')).toBeInTheDocument();
    expect(screen.getByText('Zelador')).toBeInTheDocument();
    expect(screen.getByText('Empresa B')).toBeInTheDocument();
  });

  it('deletes an experience item and refetches', async () => {
    const refetch = vi.fn();
    const candidate = makeCandidate([
      {
        id: 'exp1',
        company: 'Empresa A',
        position: 'Operador',
        candidate_id: 'c1',
      },
    ]);

    mockUseCandidate.mockReturnValue({
      candidate,
      preferences: null,
      isLoading: false,
      error: null,
      refetch,
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    const deleteBtn = findDeleteButtonForItem('Operador');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Essa ação não pode ser desfeita/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(candidateExperiencesRepository.delete).toHaveBeenCalledWith(
        'exp1',
        'c1',
      );
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('deletes a skill item via repository', async () => {
    const refetch = vi.fn();
    const candidate = makeCandidate(
      [],
      [],
      [],
      [],
      [{ id: 's1', name: 'React', level: 'Avançado', candidate_id: 'c1' }],
    );

    mockUseCandidate.mockReturnValue({
      candidate,
      preferences: null,
      isLoading: false,
      error: null,
      refetch,
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    const deleteBtn = findDeleteButtonForItem('React');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(candidateSkillsRepository.delete).toHaveBeenCalledWith('s1', 'c1');
    });
  });

  it('deletes an education item via repository', async () => {
    const refetch = vi.fn();
    const candidate = makeCandidate(
      [],
      [
        {
          id: 'edu1',
          institution: 'USP',
          course: 'Engenharia',
          candidate_id: 'c1',
        },
      ],
    );

    mockUseCandidate.mockReturnValue({
      candidate,
      preferences: null,
      isLoading: false,
      error: null,
      refetch,
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    const deleteBtn = findDeleteButtonForItem('USP');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(candidateEducationRepository.delete).toHaveBeenCalledWith(
        'edu1',
        'c1',
      );
    });
  });

  it('deletes a document item via repository', async () => {
    const refetch = vi.fn();
    const candidate = makeCandidate(
      [],
      [],
      [],
      [],
      [],
      [
        {
          id: 'd1',
          name: 'CV.pdf',
          type: 'resume',
          url: 'http://test.com/cv.pdf',
          candidate_id: 'c1',
        },
      ],
    );

    mockUseCandidate.mockReturnValue({
      candidate,
      preferences: null,
      isLoading: false,
      error: null,
      refetch,
    } as never);

    render(
      <MemoryRouter>
        <CandidateCurriculo />
      </MemoryRouter>,
    );

    const deleteBtn = findDeleteButtonForItem('CV.pdf');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(candidateDocumentsRepository.delete).toHaveBeenCalledWith(
        'd1',
        'c1',
      );
    });
  });
});
