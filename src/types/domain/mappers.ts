import type { Database } from '@/types/database';
import type {
  Tenant,
  Company,
  CompanySocials,
  Candidate,
  Application,
  Lead,
  Service,
  Supplier,
  Partner,
  BudgetRequest,
  RecruitmentProcess,
  RecruitmentStage,
  Employee,
  EmployeeDocument,
} from '@/types/domain';

export function mapTenant(
  row: Database['public']['Tables']['tenants']['Row'],
): Tenant {
  return { ...row };
}

export function mapCompany(
  row: Database['public']['Tables']['companies']['Row'],
  socials?: CompanySocials | null,
): Company {
  return {
    ...row,
    socials: socials ?? null,
  } as unknown as Company;
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
    documents: extras?.documents ?? [],
  };
}

export function mapEmployeeDocument(
  row: Database['public']['Tables']['employee_documents']['Row'],
): EmployeeDocument {
  return { ...row };
}