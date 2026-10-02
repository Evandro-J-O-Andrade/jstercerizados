export type {
  FiscalDocument,
  FiscalDocumentCreateInput,
  FiscalConfiguration,
  FiscalConfigurationCreateInput,
} from '@/types/domain/fiscal';

export interface FiscalModuleMeta {
  id: 'fiscal';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const fiscalModuleMeta: FiscalModuleMeta = {
  id: 'fiscal',
  title: 'Fiscal',
  description: 'Documentos fiscais, tributos e integrações',
  route: '/dashboard/fiscal',
  scope: 'tenant',
  requiredPermissions: ['fiscal.read'],
};
