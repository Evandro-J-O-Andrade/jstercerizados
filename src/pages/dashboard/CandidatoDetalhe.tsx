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
  const [skillNames, setSkillNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id || !currentTenantId) return;

    const fetchData = async () => {
      try {
        const data = await candidatesRepository.findById(id, currentTenantId);
        setCandidate(data);

        if (data?.skills?.length) {
          const uniqueSkillIds = Array.from(
            new Set(
              data.skills
                .map((s) => s.skill_id)
                .filter((sid): sid is string => Boolean(sid)),
            ),
          );

          if (uniqueSkillIds.length) {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
              process.env.VITE_SUPABASE_URL || '',
              process.env.VITE_SUPABASE_ANON_KEY || '',
            );

            const { data: skillsData } = await supabase
              .from('skills')
              .select('id, name')
              .in('id', uniqueSkillIds);

            if (skillsData) {
              const map: Record<string, string> = {};
              skillsData.forEach((s) => {
                map[s.id] = s.name;
              });
              setSkillNames(map);
            }
          }
        }
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
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {candidate.person?.full_name || 'Candidato'}
          </h1>
          <p className="text-sm text-gray-500">
            {candidate.headline || 'Sem headline'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getStatusLabel(candidate.status || '')}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Expectativa salarial</p>
                <p className="text-lg font-semibold text-gray-900">
                  {candidate.salary_expectation_min ||
                  candidate.salary_expectation_max
                    ? `${formatCurrency(candidate.salary_expectation_min)}${candidate.salary_expectation_max ? ` - ${formatCurrency(candidate.salary_expectation_max)}` : ''}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo de salário</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getSalaryTypeLabel(candidate.salary_type || 'negotiate')}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2 text-yellow-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fonte</p>
                <p className="text-lg font-semibold text-gray-900">
                  {candidate.source || '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cadastrado em</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(candidate.created_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 text-gray-700">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Headline</p>
                <p className="text-lg font-semibold text-gray-900">
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
            <p className="text-sm text-gray-500">
              Nenhuma habilidade registrada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {skill.skill_id
                    ? skillNames[skill.skill_id] || skill.skill_id
                    : '—'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'experiences' && (
        <div className="space-y-3">
          {candidate.experiences?.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhuma experiência registrada.
            </p>
          ) : (
            candidate.experiences?.map((exp) => (
              <div
                key={exp.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="font-medium text-gray-900">{exp.position}</p>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(exp.start_date)}{' '}
                  {exp.end_date ? `- ${formatDate(exp.end_date)}` : '• Atual'}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-700">
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
            <p className="text-sm text-gray-500">
              Nenhuma formação registrada.
            </p>
          ) : (
            candidate.education?.map((edu) => (
              <div
                key={edu.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="font-medium text-gray-900">{edu.course}</p>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-500">
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
            <p className="text-sm text-gray-500">Nenhum curso registrado.</p>
          ) : (
            candidate.courses?.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="font-medium text-gray-900">{course.name}</p>
                <p className="text-sm text-gray-600">{course.institution}</p>
                <p className="text-xs text-gray-500">
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
            <p className="text-sm text-gray-500">Nenhum idioma registrado.</p>
          ) : (
            candidate.languages?.map((lang) => (
              <div
                key={lang.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="font-medium text-gray-900">{lang.language}</p>
                <p className="text-xs text-gray-500">{lang.level}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-3">
          {candidate.documents?.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum documento registrado.
            </p>
          ) : (
            candidate.documents?.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.type}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
