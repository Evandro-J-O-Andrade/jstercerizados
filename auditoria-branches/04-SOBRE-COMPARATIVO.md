# ANÁLISE COMPARATIVA SOBRE

Data: 2026-11-02 10:05:37

## Branch: origin/test/sobre-layout-fix-478743c

- Página Sobre com timeline cinematográfica (chapters), partículas/fireflies (NightSky), PremiumCard, cards valores/serviços
- Valores: Integridade, Excelência, Equilíbrio, Cliente, Sabedoria, Preservação Meio Ambiente
- Serviços listados com imagens
- Trajetória com anos (2011, 2015, 2018, 2020, 2022, 2024)
- Política Qualidade (4 itens)
- Cobertura 50 cidades
- CTA para contato/vagas

## Branch: origin/feat/sobre-institucional-jse

- Página Sobre com timeline capítulos (pessoas, recrutamento, soluções, tecnologia, qualidade, complementar)
- Foco em RH (sem facilities enfatizado como na outra)
- Valores diferentes (Equilíbrio simplificado, sem "Cliente" explícito)
- Missão/Visão mais curtas
- Sem partículas/fireflies

## Atual (main)

- Timeline com capítulos, valores, metodologia
- Nome empresa: J&S Empregos LTDA
- Foco RH + atuação complementar mencionada

## Recomendações para extração

- PortalSidebar/Header da branch test/sobre-layout-fix-478743c (já analisados) - bons
- Sobre: considerar elementos visuais da branch test/sobre-layout-fix-478743c (NightSky/partículas, PremiumCard uso) mas preservar identidade atual
- Não copiar timeline com anos não confirmados (main já corrigiu isso)
- Verificar dependências: PremiumCard, NightSky, useReducedMotion

## DashboardAva

- Localizado em src/modules/ava/dashboard/AvaDashboard.tsx (restaurado)
- Central de Aprendizado com módulos, busca, filtros
- Não há duplicação DashboardAva.tsx na raiz - confirmado
