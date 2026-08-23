import type { Database } from '@/types/database';
import type { Client } from '@/mock/clients';

type Company = Database['public']['Tables']['companies']['Row'];

export function mapCompanyToClient(company: Company): Client {
  return {
    id: company.id,
    name: company.name,
    logo: null,
    image: null,
    website: null,
    description: company.name,
  };
}
