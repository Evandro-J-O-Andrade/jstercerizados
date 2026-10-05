export const RECRUTAMENTO_PERMISSIONS = {
  // Jobs (match DB exactly)
  vagas: 'jobs.read',
  vagasCriar: 'jobs.create',
  vagasEditar: 'jobs.update',
  vagasExcluir: 'jobs.delete',
  vagasPublicar: 'jobs.publish',
  vagasFechar: 'jobs.close',

  // Candidates (match DB exactly)
  candidatos: 'candidates.read',
  candidatosCriar: 'candidates.create',
  candidatosEditar: 'candidates.update',
  candidatosExcluir: 'candidates.delete',
  candidatosDocumentosLer: 'candidates.documents.read',
  candidatosDocumentosGerenciar: 'candidates.documents.manage',
  candidatosPerfilLer: 'candidates.profile.read',

  // Recruitment Process
  processos: 'recruitment.read',
  processosCriar: 'recruitment.create',
  processosEditar: 'recruitment.update',
  processosExcluir: 'recruitment.delete',
  processosAvancar: 'recruitment.advance',
  processosRejeitar: 'recruitment.reject',
  etapasGerenciar: 'recruitment.stage.manage',

  // Applications (canonical verbs)
  candidaturas: 'applications.read',
  candidaturasCriar: 'applications.create',
  candidaturasAvancar: 'applications.advance',
  candidaturasRejeitar: 'applications.reject',
  candidaturasHistorico: 'applications.history.read',

  // Talent Pool
  talentPool: 'talent_pool.read',
  talentPoolGerenciar: 'talent_pool.manage',
  talentPoolMatch: 'talent_pool.match',

  // Recruitment Demands
  demandas: 'recruitment_demands.read',
  demandasCriar: 'recruitment_demands.create',
  demandasEditar: 'recruitment_demands.update',
  demandasExcluir: 'recruitment_demands.delete',

  // Relatórios (gate alinhado com o item de navegação no ModuleRegistry)
  relatorios: 'reports.read',
} as const;

export type RecrutamentoPermissionKey = keyof typeof RECRUTAMENTO_PERMISSIONS;