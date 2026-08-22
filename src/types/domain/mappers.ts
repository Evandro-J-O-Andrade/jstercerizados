import type { Database } from '@/types/database';
import type {
  Tenant,
  Company,
  Candidate,
  Job,
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

export function mapJob(row: Database['public']['Tables']['jobs']['Row']): Job {
  return { ...row };
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
