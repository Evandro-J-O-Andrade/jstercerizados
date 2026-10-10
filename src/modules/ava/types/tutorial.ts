export type AvaModule =
  | 'candidato'
  | 'recrutamento'
  | 'rh'
  | 'empresas'
  | 'financeiro'
  | 'contabilidade'
  | 'fiscal'
  | 'estoque'
  | 'servicos'
  | 'suporte'
  | 'comercial'
  | 'pos'
  | 'sistema';

export type TutorialStatus = 'draft' | 'published' | 'archived';

export type TutorialVideoKind = 'short' | 'full' | 'quicktip';

export interface TutorialStep {
  id: string;
  order: number;
  title: string;
  description: string;
  tip?: string;
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  module: AvaModule;
  summary: string;
  description: string;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  videoKind: TutorialVideoKind;
  steps: TutorialStep[];
  faq: { question: string; answer: string }[];
  tags: string[];
  status: TutorialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TutorialFilter {
  module?: AvaModule;
  status?: TutorialStatus;
  query?: string;
}
