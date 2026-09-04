import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  Star,
} from 'lucide-react';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Candidate } from '@/types/domain/candidate';

type TabValue =
  | 'overview'
  | 'skills'
  | 'experiences'
  | 'education'
  | 'courses'
  | 'languages'
  | 'documents';

const CANDIDATE_STATUS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'archived', label: 'Arquivado' },
  { value: 'blacklisted', label: 'Bloqueado' },
] as const;

const SALARY_TYPE_OPTIONS = [
  { value: 'negotiate', label: 'Negociável' },
  { value: 'range', label: 'Faixa' },
  { value: 'monthly', label: 'Mensal' },
] as const;

export default function CandidatoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  useEffect(() => {
    if (!id || !currentTenantId) return;

    const fetchData = async () => {
      try {
        const data = await candidatesRepository.findById(id, currentTenantId);
        setCandidate(data);
      } catch (error) {
        console.error('[CandidatoDetalhe] Falha ao carregar candidato', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentTenantId]);

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (value: string) => {
    return CANDIDATE_STATUS.find((s) => s.value === value)?.label || value;
  };

  const getSalaryTypeLabel = (value: string) => {
    return SALARY_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Carregando candidato...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6">
        <p className="text-destructive">Candidato não encontrado.</p>
      </div>
    );
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'overview', label: 'Visão geral' },
    { value: 'skills', label: 'Habilidades' },
    { value: 'experiences', label: 'Experiências' },
    { value: 'education', label: 'Formação' },
    { value: 'courses', label: 'Cursos' },
    { value: 'languages', label: 'Idiomas' },
    { value: 'documents', label: 'Documentos' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/candidatos')}
          className="rounded-lg p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {candidate.person?.full_name || 'Candidato'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {candidate.headline || 'Sem headline'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-lg font-semibold text-foreground">
                  {getStatusLabel(candidate.status || '')}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expectativa salarial</p>
                <p className="text-lg font-semibold text-foreground">
                  {candidate.salary_expectation_min ||
                  candidate.salary_expectation_max
                    ? `${formatCurrency(candidate.salary_expectation_min)}${candidate.salary_expectation_max ? ` - ${formatCurrency(candidate.salary_expectation_max)}` : ''}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de salário</p>
                <p className="text-lg font-semibold text-foreground">
                  {getSalaryTypeLabel(candidate.salary_type || 'negotiate')}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2 text-yellow-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fonte</p>
                <p className="text-lg font-semibold text-foreground">
                  {candidate.source || '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cadastrado em</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatDate(candidate.created_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-foreground">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Headline</p>
                <p className="text-lg font-semibold text-foreground">
                  {candidate.headline || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-3">
          {candidate.skills?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma habilidade registrada.
            </p>
          ) : (
              <div className="flex flex-wrap gap-2">
              {candidate.skills?.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {skill.name || '—'}
                  {skill.level ? ` (${skill.level})` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'experiences' && (
        <div className="space-y-3">
          {candidate.experiences?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma experiência registrada.
            </p>
          ) : (
            candidate.experiences?.map((exp) => (
              <div
                key={exp.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{exp.position}</p>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(exp.start_date)}{' '}
                  {exp.end_date ? `- ${formatDate(exp.end_date)}` : '• Atual'}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-foreground">
                    {exp.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'education' && (
        <div className="space-y-3">
          {candidate.education?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma formação registrada.
            </p>
          ) : (
            candidate.education?.map((edu) => (
              <div
                key={edu.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{edu.course}</p>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(edu.start_date)}{' '}
                  {edu.end_date ? `- ${formatDate(edu.end_date)}` : ''}{' '}
                  {edu.degree ? `• ${edu.degree}` : ''}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-3">
          {candidate.courses?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum curso registrado.</p>
          ) : (
            candidate.courses?.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{course.name}</p>
                <p className="text-sm text-muted-foreground">{course.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(course.completed_at)}{' '}
                  {course.hours ? `• ${course.hours}h` : ''}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'languages' && (
        <div className="space-y-3">
          {candidate.languages?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum idioma registrado.</p>
          ) : (
            candidate.languages?.map((lang) => (
              <div
                key={lang.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{lang.language}</p>
                <p className="text-xs text-muted-foreground">{lang.level}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-3">
          {candidate.documents?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum documento registrado.
            </p>
          ) : (
            candidate.documents?.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.type}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

