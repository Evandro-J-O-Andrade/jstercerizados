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
    company_id: row.company_relationship_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    benefits: row.benefits,
    employment_type: employmentType,
    location,
    salary,
    work_mode: row.work_mode as Job['work_mode'],
    status: row.status,
    published_at: row.published_at,
    closed_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    company: undefined,
    applicationsCount: row.applications_count,
  };
}

export function mapApplication(
  row: Database['public']['Tables']['applications']['Row'],
): Application {
  return { ...row };
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
