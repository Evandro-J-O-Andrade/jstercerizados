import { fiscalRepositories } from '../repositories';
import type { FiscalDocumentCreateInput } from '../types';

class FiscalService {
  async getDocumentos(tenantId: string) {
    return fiscalRepositories.fiscal.findAllDocuments(tenantId);
  }

  async createDocumento(
    input: FiscalDocumentCreateInput & { tenant_id: string },
  ) {
    return fiscalRepositories.fiscal.createDocument(input);
  }

  async getConfiguracoes(tenantId: string) {
    return fiscalRepositories.fiscal.findConfiguration(tenantId);
  }
}

export const fiscalService = new FiscalService();
