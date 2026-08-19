import { describe, it, expect } from 'vitest';
import {
  SERVICE_IMAGES,
  CANDIDATE_IMAGES,
  FALLBACK_IMAGES,
  HERO_ASSETS,
  PARTNER_ASSETS,
} from '@/content/assets';
import { IMAGES } from '@/config/images';
import { IMAGE_FALLBACKS } from '@/config/imageFallbacks';
import { mockServices } from '@/services/mock/services';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

function resolvePublicPath(assetPath: string): string {
  const relative = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return path.join(PROJECT_ROOT, 'public', relative);
}

function assetExists(assetPath: string): boolean {
  const fullPath = resolvePublicPath(assetPath);
  try {
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

describe('GATE-ASSETS-02: Asset Runtime Integrity', () => {
  describe('SERVICE_IMAGES', () => {
    const entries = Object.entries(SERVICE_IMAGES) as [string, string][];

    it('todos os assets registrados existem fisicamente', () => {
      const missing = entries.filter(([, path]) => !assetExists(path));
      expect(
        missing,
        `Assets faltando: ${missing.map(([k]) => k).join(', ')}`,
      ).toHaveLength(0);
    });

    it('nenhum asset aponta para pasta inexistente', () => {
      const invalid = entries.filter(
        ([, path]) => !path.startsWith('/images/'),
      );
      expect(
        invalid,
        `Caminhos inválidos: ${invalid.map(([k]) => k).join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('CANDIDATE_IMAGES', () => {
    const entries = Object.entries(CANDIDATE_IMAGES) as [string, string][];

    it('todos os assets registrados existem fisicamente', () => {
      const missing = entries.filter(([, path]) => !assetExists(path));
      expect(
        missing,
        `Assets faltando: ${missing.map(([k]) => k).join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('FALLBACK_IMAGES', () => {
    const entries = Object.entries(FALLBACK_IMAGES) as [string, string][];

    it('todos os fallbacks registrados existem fisicamente', () => {
      const missing = entries.filter(([, path]) => !assetExists(path));
      expect(
        missing,
        `Fallbacks faltando: ${missing.map(([k]) => k).join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('HERO_ASSETS', () => {
    const entries = Object.entries(HERO_ASSETS) as [
      string,
      string | string[],
    ][];

    it('todos os hero assets existem fisicamente', () => {
      const missing: string[] = [];
      for (const [key, value] of entries) {
        if (Array.isArray(value)) {
          value.forEach((path, index) => {
            if (!assetExists(path)) {
              missing.push(`${key}[${index}]: ${path}`);
            }
          });
        } else if (!assetExists(value)) {
          missing.push(`${key}: ${value}`);
        }
      }
      expect(
        missing,
        `Hero assets faltando: ${missing.join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('PARTNER_ASSETS', () => {
    const entries = Object.entries(PARTNER_ASSETS) as [string, string][];

    it('todos os partner assets existem fisicamente', () => {
      const missing = entries.filter(([, path]) => !assetExists(path));
      expect(
        missing,
        `Partner assets faltando: ${missing.map(([k]) => k).join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('IMAGES config', () => {
    it('todos os assets de imagem existem fisicamente', () => {
      const paths = [
        IMAGES.logo.light,
        IMAGES.logo.dark,
        IMAGES.logo.sidebar,
        IMAGES.logo.sidebarIcon,
        IMAGES.logo.favicon,
        IMAGES.hero.background,
        IMAGES.hero.security,
        IMAGES.hero.overlay,
        IMAGES.hero.watermark,
        IMAGES.hero.grid,
        IMAGES.hero.lines,
        IMAGES.hero.cardheros,
        ...IMAGES.hero.home.slides,
        IMAGES.hero.servicos.src,
        IMAGES.hero.sobre.src,
        IMAGES.hero.trabalheConosco.src,
        IMAGES.hero.parceiros.src,
        IMAGES.hero.fornecedores.src,
        IMAGES.hero.suporte.src,
        IMAGES.hero.contato.src,
        IMAGES.hero.login.src,
        ...Object.values(IMAGES.services),
        IMAGES.partners.vectorEngenharia,
        IMAGES.partners.mistral,
        IMAGES.partners.cadrempresaspareceiras,
        IMAGES.empresas.cadastro,
        IMAGES.suporte.hero,
        IMAGES.trabalheConosco.hero,
        IMAGES.backgrounds.hero,
        IMAGES.backgrounds.pattern,
        IMAGES.backgrounds.texture,
        IMAGES.backgrounds.heroGrid,
        IMAGES.backgrounds.heroLines,
      ];

      const missing = paths.filter((path) => !assetExists(path));
      expect(
        missing,
        `IMAGES config faltando: ${missing.join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('IMAGE_FALLBACKS', () => {
    const entries = Object.entries(IMAGE_FALLBACKS) as [string, string][];

    it('todos os fallbacks do config existem fisicamente', () => {
      const missing = entries.filter(([, path]) => !assetExists(path));
      expect(
        missing,
        `Fallbacks config faltando: ${missing.map(([k]) => k).join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('sem referências quebradas em código', () => {
    it('não há caminhos /images/ que não existem no disco', () => {
      const srcDir = path.join(PROJECT_ROOT, 'src');
      const publicDir = path.join(PROJECT_ROOT, 'public');

      const files = getTsFiles(srcDir);
      const broken: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.matchAll(/src=['"](\/images\/[^'"]+)['"]/g);
        for (const match of matches) {
          const imagePath = match[1];
          const fullPath = path.join(publicDir, imagePath.slice(1));
          if (!fs.existsSync(fullPath)) {
            broken.push(`${file}: ${imagePath}`);
          }
        }
      }

      expect(
        broken,
        `Referências quebradas: ${broken.join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('sem assets órfãos', () => {
    it('assets registrados em SERVICE_IMAGES, CANDIDATE_IMAGES, FALLBACK_IMAGES, HERO_ASSETS, PARTNER_ASSETS, IMAGES e IMAGE_FALLBACKS existem', () => {
      const registeredPaths = new Set<string>();

      const collect = (obj: Record<string, unknown>) => {
        for (const value of Object.values(obj)) {
          if (typeof value === 'string') {
            registeredPaths.add(value);
          } else if (Array.isArray(value)) {
            for (const item of value) {
              if (typeof item === 'string') {
                registeredPaths.add(item);
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            collect(value as Record<string, unknown>);
          }
        }
      };

      collect(SERVICE_IMAGES as Record<string, unknown>);
      collect(CANDIDATE_IMAGES as Record<string, unknown>);
      collect(FALLBACK_IMAGES as Record<string, unknown>);
      collect(HERO_ASSETS as Record<string, unknown>);
      collect(PARTNER_ASSETS as Record<string, unknown>);
      collect(IMAGES as Record<string, unknown>);
      collect(IMAGE_FALLBACKS as Record<string, unknown>);

      const missing = Array.from(registeredPaths).filter(
        (p) => !assetExists(p),
      );
      expect(
        missing,
        `Assets registrados faltando: ${missing.join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('GATE-ASSETS-03: regras de domínio e caminhos canônicos', () => {
    it('Controle de Acesso não pode apontar para imagem de Terceirização', () => {
      const service = mockServices.find((s) => s.slug === 'controle-acesso');
      expect(service, 'Serviço controle-acesso não encontrado').toBeDefined();
      expect(service!.image).toMatch(
        /\/images\/servicos\/controle-acesso\//,
        'Controle de Acesso deve usar caminho canônico /images/servicos/controle-acesso/',
      );
    });

    it('Portaria não pode apontar para imagem de Terceirização', () => {
      const service = mockServices.find((s) => s.slug === 'portaria');
      expect(service, 'Serviço portaria não encontrado').toBeDefined();
      expect(service!.image).toMatch(
        /\/images\/servicos\/portaria\//,
        'Portaria deve usar caminho canônico /images/servicos/portaria/',
      );
    });

    it('referências canônicas de serviços devem existir fisicamente', () => {
      const canonicalPaths = [
        SERVICE_IMAGES.controleAcessoReal,
        SERVICE_IMAGES.portariaReal,
        SERVICE_IMAGES.assessoriaRh,
        SERVICE_IMAGES.jardinagemReal,
        SERVICE_IMAGES.limpezaReal,
        SERVICE_IMAGES.zeladoriaReal,
        SERVICE_IMAGES.terceirizacaoReal,
        SERVICE_IMAGES.maoDeObraTemporariaReal,
        SERVICE_IMAGES.maoDeObraEfetivaReal,
        SERVICE_IMAGES.huntingReal,
        SERVICE_IMAGES.avaliacaoPerfilReal,
      ];

      const missing = canonicalPaths.filter((p) => !assetExists(p));
      expect(
        missing,
        `Assets canônicos faltando: ${missing.join(', ')}`,
      ).toHaveLength(0);
    });

    it('não devem existir referências legadas /images/services/ em código ativo', () => {
      const srcDir = path.join(PROJECT_ROOT, 'src');
      const activeFiles = [
        path.join(srcDir, 'services', 'mock', 'services.ts'),
        path.join(srcDir, 'content', 'homeHero.ts'),
        path.join(srcDir, 'pages', 'Servicos.tsx'),
        path.join(srcDir, 'pages', 'ServicoDetalhe.tsx'),
        path.join(srcDir, 'components', 'sections', 'ServiceCard.tsx'),
      ];

      const broken: string[] = [];

      for (const file of activeFiles) {
        if (!fs.existsSync(file)) continue;
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.matchAll(/\/images\/services\//g);
        for (const match of matches) {
          broken.push(`${file}: ${match[0]}`);
        }
      }

      expect(
        broken,
        `Referências legadas /images/services/ encontradas: ${broken.join(', ')}`,
      ).toHaveLength(0);
    });
  });

  describe('GATE-ASSETS-04: mapeamento canônico dos cards', () => {
    it('Mão de Obra Temporária e Efetiva não compartilham a mesma imagem', () => {
      const temporaria = mockServices.find(
        (s) => s.slug === 'mao-de-obra-temporaria',
      );
      const efetiva = mockServices.find(
        (s) => s.slug === 'mao-de-obra-efetiva',
      );

      expect(
        temporaria,
        'Serviço mao-de-obra-temporaria não encontrado',
      ).toBeDefined();
      expect(
        efetiva,
        'Serviço mao-de-obra-efetiva não encontrado',
      ).toBeDefined();

      expect(temporaria!.image).toBe(SERVICE_IMAGES.maoDeObraTemporariaReal);
      expect(efetiva!.image).toBe(SERVICE_IMAGES.maoDeObraEfetivaReal);
      expect(temporaria!.image).not.toBe(efetiva!.image);
    });

    it('Avaliação de Perfil usa imagem fotográfica canônica .jpg', () => {
      const service = mockServices.find((s) => s.slug === 'avaliacao-perfil');
      expect(service, 'Serviço avaliacao-perfil não encontrado').toBeDefined();
      expect(service!.image).toBe(SERVICE_IMAGES.avaliacaoPerfilReal);
      expect(service!.image).not.toContain('.svg');
    });

    it('Banco de Talentos usa imagem fotográfica canônica .jpg', () => {
      const service = mockServices.find((s) => s.slug === 'banco-de-talentos');
      expect(service, 'Serviço banco-de-talentos não encontrado').toBeDefined();
      expect(service!.image).toBe(SERVICE_IMAGES.bancoTalentoReal);
      expect(service!.image).toMatch(
        /banco-de-talentos\/banco-de-talentos\.jpg$/,
      );
    });

    it('Executive Search (Hunting) usa executive-search.jpg', () => {
      const service = mockServices.find((s) => s.slug === 'hunting');
      expect(service, 'Serviço hunting não encontrado').toBeDefined();
      expect(service!.image).toBe(SERVICE_IMAGES.huntingReal);
      expect(service!.image).not.toContain('.svg');
    });

    it('nenhum card usa fallback quando existe asset canônico', () => {
      const canonicalSlugs = [
        'assessoria-rh',
        'recrutamento-selecao',
        'mao-de-obra-temporaria',
        'mao-de-obra-efetiva',
        'hunting',
        'avaliacao-perfil',
        'banco-de-talentos',
        'processo-de-rh',
        'facilities',
        'jardinagem',
        'limpeza-de-fachada',
        'limpeza-de-vidros',
        'faxina-diarista',
        'limpeza-pos-obra',
        'limpeza-pre-mudanca',
        'limpeza-pos-mudanca',
        'terceirizacao',
        'zeladoria-manutencao',
        'controle-acesso',
        'portaria',
      ];

      const bad = canonicalSlugs
        .map((slug) => mockServices.find((s) => s.slug === slug))
        .filter((service): service is NonNullable<typeof service> =>
          Boolean(service),
        )
        .filter((service) => service.image.includes('fallback'));

      expect(
        bad,
        `Cards usando fallback indevido: ${bad.map((s) => s.slug).join(', ')}`,
      ).toHaveLength(0);
    });
  });
});

function getTsFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getTsFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }

  return results;
}
