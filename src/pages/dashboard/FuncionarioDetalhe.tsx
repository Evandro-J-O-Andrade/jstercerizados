import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';
import { employeesRepository } from '@/repositories/employees.repository';
import { employeeEducationsRepository } from '@/repositories/employee-education.repository';
import { employeeExperiencesRepository } from '@/repositories/employee-experiences.repository';
import { employeeCoursesRepository } from '@/repositories/employee-courses.repository';
import { employeeLanguagesRepository } from '@/repositories/employee-languages.repository';
import { employeeSkillsRepository } from '@/repositories/employee-skills.repository';
import { employeeDocumentsRepository } from '@/repositories/employee-documents.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Employee } from '@/types/domain/employee';
import type { EmployeeExperience } from '@/types/domain/employee-experience';
import type { EmployeeEducation } from '@/types/domain/employee-education';
import type { EmployeeCourse } from '@/types/domain/employee-course';
import type { EmployeeLanguage } from '@/types/domain/employee-language';
import type { EmployeeSkill } from '@/types/domain/employee-skill';
import type { EmployeeDocument } from '@/types/domain/employee-document';

type TabValue =
  | 'overview'
  | 'experiences'
  | 'education'
  | 'courses'
  | 'languages'
  | 'skills'
  | 'documents';

const EMPLOYEE_STATUS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'terminated', label: 'Desligado' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'on_leave', label: 'Afastado' },
] as const;

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'clt', label: 'CLT' },
  { value: 'internship', label: 'Estágio' },
  { value: 'temporary', label: 'Temporário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contracted', label: 'Contratado' },
  { value: 'cd', label: 'CD' },
] as const;

const WORK_MODE_OPTIONS = [
  { value: 'onsite', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'remote', label: 'Remoto' },
] as const;

export default function FuncionarioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [experiences, setExperiences] = useState<EmployeeExperience[]>([]);
  const [education, setEducation] = useState<EmployeeEducation[]>([]);
  const [courses, setCourses] = useState<EmployeeCourse[]>([]);
  const [languages, setLanguages] = useState<EmployeeLanguage[]>([]);
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  useEffect(() => {
    if (!id || !currentTenantId) return;

    const fetchData = async () => {
      try {
        const [
          emp,
          expData,
          eduData,
          coursesData,
          langData,
          skillsData,
          docsData,
        ] = await Promise.all([
          employeesRepository.findById(id, currentTenantId),
          employeeExperiencesRepository.findAll(id),
          employeeEducationsRepository.findAll(id),
          employeeCoursesRepository.findAll(id),
          employeeLanguagesRepository.findAll(id),
          employeeSkillsRepository.findAll(id),
          employeeDocumentsRepository.findAll(id),
        ]);

        setEmployee(emp);
        setExperiences(expData);
        setEducation(eduData);
        setCourses(coursesData);
        setLanguages(langData);
        setSkills(skillsData);
        setDocuments(docsData);
      } catch (error) {
        console.error('[FuncionarioDetalhe] Falha ao carregar dados', error);
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
    return EMPLOYEE_STATUS.find((s) => s.value === value)?.label || value;
  };

  const getEmploymentTypeLabel = (value: string) => {
    return (
      EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === value)?.label || value
    );
  };

  const getWorkModeLabel = (value: string) => {
    return WORK_MODE_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Carregando funcionário...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <p className="text-destructive">Funcionário não encontrado.</p>
      </div>
    );
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'overview', label: 'Visão geral' },
    { value: 'experiences', label: 'Experiências' },
    { value: 'education', label: 'Formação' },
    { value: 'courses', label: 'Cursos' },
    { value: 'languages', label: 'Idiomas' },
    { value: 'skills', label: 'Habilidades' },
    { value: 'documents', label: 'Documentos' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/funcionarios')}
          className="rounded-lg p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {employee.person?.full_name || 'Funcionário'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {employee.job_title || 'Sem cargo'}{' '}
            {employee.department ? `• ${employee.department}` : ''}
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
                  {getStatusLabel(employee.status || '')}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de vínculo</p>
                <p className="text-lg font-semibold text-foreground">
                  {getEmploymentTypeLabel(employee.employment_type || '')}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Modalidade</p>
                <p className="text-lg font-semibold text-foreground">
                  {getWorkModeLabel(employee.work_mode || '')}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2 text-yellow-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data de admissão</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatDate(employee.hire_date)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salário</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(employee.salary)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Matrícula</p>
                <p className="text-lg font-semibold text-foreground">
                  {employee.registration || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'experiences' && (
        <div className="space-y-3">
          {experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma experiência registrada.
            </p>
          ) : (
            experiences.map((exp) => (
              <div
                key={exp.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{exp.job_title}</p>
                <p className="text-sm text-muted-foreground">{exp.company_name}</p>
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
          {education.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma formação registrada.
            </p>
          ) : (
            education.map((edu) => (
              <div
                key={edu.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{edu.course}</p>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(edu.start_date)}{' '}
                  {edu.end_date ? `- ${formatDate(edu.end_date)}` : ''}{' '}
                  {edu.is_completed ? '• Concluído' : ''}
                </p>
                {edu.field_of_study && (
                  <p className="mt-1 text-sm text-foreground">
                    {edu.field_of_study}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-3">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum curso registrado.</p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">
                  {course.course_name}
                </p>
                <p className="text-sm text-muted-foreground">{course.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(course.completion_date)}{' '}
                  {course.hours ? `• ${course.hours}h` : ''}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'languages' && (
        <div className="space-y-3">
          {languages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum idioma registrado.</p>
          ) : (
            languages.map((lang) => (
              <div
                key={lang.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{lang.language}</p>
                <p className="text-xs text-muted-foreground">
                  {lang.proficiency} {lang.is_primary ? '• Principal' : ''}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-3">
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma habilidade registrada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {skill.skill_name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum documento registrado.
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="font-medium text-foreground">{doc.document_name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.document_type} {doc.is_verified ? '• Verificado' : ''}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

