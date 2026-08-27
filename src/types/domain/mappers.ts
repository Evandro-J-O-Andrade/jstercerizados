import type { Database } from '@/types/database';
import type {
  Tenant,
  Company,
  Candidate,
  Job,
  JobRow,
  Application,
  Lead,
  Service,
  Supplier,
  Partner,
  BudgetRequest,
  RecruitmentProcess,
  RecruitmentStage,
  Employee,
  EmployeeExperience,
  EmployeeEducation,
  EmployeeCourse,
  EmployeeLanguage,
  EmployeeSkill,
} from '@/types/domain';

export function mapTenant(
  row: Database['public']['Tables']['tenants']['Row'],
): Tenant {
  return { ...row };
}

export function mapCompany(
  row: Database['public']['Tables']['companies']['Row'],
): Company {
  return { ...row };
}

export function mapCandidate(
  row: Database['public']['Tables']['candidates']['Row'],
  extras?: Partial<Candidate>,
): Candidate {
  return {
    ...row,
    person: extras?.person,
    experiences: extras?.experiences ?? [],
    education: extras?.education ?? [],
    courses: extras?.courses ?? [],
    languages: extras?.languages ?? [],
    skills: extras?.skills ?? [],
    documents: extras?.documents ?? [],
    profileViews: extras?.profileViews ?? [],
  };
}

export function mapJob(row: JobRow): Job {
  const contractType = row.contract_type || '';
  const employmentType = contractType || null;

  const city = row.city || '';
  const state = row.state || '';
  const locationDetail = row.location_detail || '';
  const location =
    [city, state].filter(Boolean).join(', ') || locationDetail || null;

  let salary: string | null = null;
  if (
    row.salary_type === 'range' &&
    row.salary_min != null &&
    row.salary_max != null
  ) {
    salary = `${row.salary_min.toLocaleString('pt-BR')} – ${row.salary_max.toLocaleString('pt-BR')}`;
  } else if (row.salary_type === 'monthly' && row.salary_min != null) {
    salary = `${row.salary_min.toLocaleString('pt-BR')}/mês`;
  } else {
    salary = 'A combinar';
  }

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    company_relationship_id: row.company_relationship_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    benefits: row.benefits,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    salary_type: row.salary_type,
    contract_type: row.contract_type,
    seniority: row.seniority,
    work_hours: row.work_hours,
    work_mode: row.work_mode as Job['work_mode'],
    city: row.city,
    state: row.state,
    location_detail: row.location_detail,
    status: row.status,
    views_count: row.views_count,
    applications_count: row.applications_count,
    published_at: row.published_at,
    expires_at: row.expires_at,
    metadata: row.metadata,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    employment_type: employmentType,
    location,
    salary,
    closed_at: row.expires_at,
  };
}

export function mapApplication(
  row: Database['public']['Tables']['applications']['Row'],
  extras?: Partial<Application>,
): Application {
  return {
    ...row,
    job: extras?.job,
    candidate: extras?.candidate,
    history: extras?.history ?? [],
    snapshot: extras?.snapshot ?? null,
  };
}

export function mapLead(
  row: Database['public']['Tables']['leads']['Row'],
): Lead {
  return { ...row };
}

export function mapService(
  row: Database['public']['Tables']['services']['Row'],
): Service {
  return { ...row };
}

export function mapSupplier(
  row: Database['public']['Tables']['suppliers']['Row'],
): Supplier {
  return { ...row };
}

export function mapPartner(
  row: Database['public']['Tables']['partners']['Row'],
): Partner {
  return { ...row };
}

export function mapBudgetRequest(
  row: Database['public']['Tables']['budget_requests']['Row'],
): BudgetRequest {
  return { ...row };
}

export function mapRecruitmentProcess(
  row: Database['public']['Tables']['recruitment_processes']['Row'],
  extras?: Partial<RecruitmentProcess>,
): RecruitmentProcess {
  return {
    ...row,
    job: extras?.job,
  };
}

export function mapRecruitmentStage(
  row: Database['public']['Tables']['recruitment_stages']['Row'],
): RecruitmentStage {
  return { ...row };
}

export function mapEmployee(
  row: Database['public']['Tables']['employees']['Row'],
  extras?: Partial<Employee>,
): Employee {
  return {
    ...row,
    person: extras?.person,
    company: extras?.company ?? null,
    manager: extras?.manager ?? null,
    documents: extras?.documents ?? [],
    education: extras?.education ?? [],
    experiences: extras?.experiences ?? [],
    skills: extras?.skills ?? [],
    languages: extras?.languages ?? [],
    courses: extras?.courses ?? [],
  };
}

export function mapEmployeeExperience(
  row: Database['public']['Tables']['employee_experiences']['Row'],
): EmployeeExperience {
  return { ...row };
}

export function mapEmployeeEducation(
  row: Database['public']['Tables']['employee_education']['Row'],
): EmployeeEducation {
  return { ...row };
}

export function mapEmployeeCourse(
  row: Database['public']['Tables']['employee_courses']['Row'],
): EmployeeCourse {
  return { ...row };
}

export function mapEmployeeLanguage(
  row: Database['public']['Tables']['employee_languages']['Row'],
): EmployeeLanguage {
  return { ...row };
}

export function mapEmployeeSkill(
  row: Database['public']['Tables']['employee_skills']['Row'],
): EmployeeSkill {
  return { ...row };
}
