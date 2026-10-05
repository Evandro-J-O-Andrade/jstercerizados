export const CANDIDATO_PERMISSIONS = {
  dashboard: 'candidates.self.read',
  vagas: 'jobs.read',
  vagasRecomendadas: 'jobs.read',
  buscarVagas: 'jobs.read',
  candidaturas: 'applications.read',
  favoritas: 'jobs.read',
  alertas: 'candidate_job_alerts.manage',
  curriculo: 'candidates.self.read',
  experiencia: 'candidates.self.read',
  formacao: 'candidates.self.read',
  cursos: 'candidates.self.read',
  habilidades: 'candidates.self.read',
  idiomas: 'candidates.self.read',
  documentos: 'candidate_documents.read',
  preferencias: 'candidates.self.update',
  conta: 'account.read',
  perfil: 'candidates.self.read',
  entrevistas: 'applications.read',
  historico: 'applications.read',
  notificacoes: 'notifications.read',
  configuracoes: 'account.update',
} as const;

export type CandidatoPermission =
  (typeof CANDIDATO_PERMISSIONS)[keyof typeof CANDIDATO_PERMISSIONS];
