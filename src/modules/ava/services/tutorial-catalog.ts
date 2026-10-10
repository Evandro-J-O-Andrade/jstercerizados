import type { Tutorial, TutorialStep } from '../types';

export function makeStep(
  id: string,
  order: number,
  title: string,
  description: string,
  tip?: string,
): TutorialStep {
  return { id, order, title, description, tip };
}

export function makeTutorial(
  overrides: Partial<Tutorial> & {
    id: string;
    slug: string;
    title: string;
    module: any;
  },
): Tutorial {
  return {
    summary: '',
    description: '',
    videoUrl: null,
    videoDurationSeconds: null,
    videoKind: 'full',
    steps: [],
    faq: [],
    tags: [],
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
