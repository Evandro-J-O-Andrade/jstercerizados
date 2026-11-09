#!/usr/bin/env python3
"""Overlay seguro da navegação contextual — dry-run por padrão.

Uso:
  python scripts/install_navigation.py C:\\NewWaveProjetos\\jrtercerisados
  python scripts/install_navigation.py C:\\NewWaveProjetos\\jrtercerisados --apply

Não mexe no DispatcherMaster/rotas pós-login, Auth, Supabase ou footer.
Falha se houver arquivo alvo dirty (incluindo staged) ou arquivo novo com colisão.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REPLACEMENTS = [
    Path('src/modules/admin/AdminSidebar/index.tsx'),
    Path('src/shell/AdminModuleLayout.tsx'),
    Path('src/shell/ModuleLayout.tsx'),
    Path('src/modules/admin-tenant/layout/AdminTenantLayout.tsx'),
]
NEW = [
    Path('src/components/navigation/cell-navigation-model.ts'),
    Path('src/components/navigation/cell-navigation-model.test.ts'),
    Path('src/components/navigation/useCellNavigation.ts'),
    Path('src/components/navigation/ContextualCellSidebar.tsx'),
    Path('src/components/navigation/ModuleHubPage.tsx'),
]
PATCHED = [Path('src/App.tsx'), Path('src/shell/AdminShell.tsx')]


def clean(repo: Path, path: Path) -> bool:
    for cmd in (["git", "diff", "--quiet", "--", str(path)],
                ["git", "diff", "--cached", "--quiet", "--", str(path)]):
        if subprocess.run(cmd, cwd=repo, capture_output=True).returncode != 0:
            return False
    return True


def once(source: str, original: str, new: str, label: str) -> str:
    if source.count(original) != 1:
        raise ValueError(f'{label}: baseline divergiu ou âncora não é única. Mesclar manualmente.')
    return source.replace(original, new, 1)


def patch_app(source: str) -> str:
    if 'path="modulos"' in source or "components/navigation/ModuleHubPage" in source:
        raise ValueError('App.tsx já parece integrar o hub. Não duplicar.')
    source = once(
        source,
        "import { AppShell } from '@/components/layout/AppShell';\n",
        "import { AppShell } from '@/components/layout/AppShell';\nimport ModuleHubPage from '@/components/navigation/ModuleHubPage';\n",
        'Import de ModuleHubPage',
    )
    source = once(
        source,
        '            <Route path="" element={<DashboardHome />} />',
        '            <Route path="" element={<DashboardHome />} />\n'
        '            <Route path="modulos" element={<ModuleHubPage />} />',
        'Rota do hub',
    )
    return source


def patch_adminshell(source: str) -> str:
    if 'resolveNavigationCell' in source:
        raise ValueError('AdminShell já pode ter título contextual. Revisar merge.')
    source = once(source,
        "import { Outlet } from 'react-router-dom';",
        "import { Outlet, useLocation } from 'react-router-dom';",
        'Import useLocation',
    )
    source = once(source,
        "import { COMPANY } from '@/config';",
        "import { COMPANY } from '@/config';\n"
        "import { cellRegistry } from '@/core/registry/CellRegistryContract';\n"
        "import { resolveNavigationCell, getModuleName } from '@/components/navigation/cell-navigation-model';",
        'Imports navegação',
    )
    source = once(source,
        "  const currentModuleTitle = moduleTitle || 'J&S Empregos';",
        "  const { pathname } = useLocation();\n"
        "  const activeCell = resolveNavigationCell(pathname, cellRegistry.getEnabled().map(({ cell }) => cell));\n"
        "  const currentModuleTitle = moduleTitle || (activeCell ? getModuleName(activeCell) : 'J&S Empregos');",
        'Título de módulo',
    )
    return source


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('repo', type=Path)
    parser.add_argument('--apply', action='store_true')
    opts = parser.parse_args()
    repo = opts.repo.resolve()
    if not all((repo / file).exists() for file in ['.git', 'AGENTS.md', 'src/App.tsx']):
        print('BLOQUEADO: não é o worktree J&S esperado.')
        return 2
    targets = {}
    for path in [*REPLACEMENTS, *NEW]:
        targets[path] = (ROOT / path).read_text(encoding='utf-8-sig')
    try:
        targets[Path('src/App.tsx')] = patch_app((repo / 'src/App.tsx').read_text(encoding='utf-8-sig'))
        targets[Path('src/shell/AdminShell.tsx')] = patch_adminshell((repo / 'src/shell/AdminShell.tsx').read_text(encoding='utf-8-sig'))
    except ValueError as error:
        print('BLOQUEADO:', error)
        return 3
    conflicts = []
    for path in targets:
        dest = repo / path
        if path in NEW and dest.exists():
            conflicts.append(f'Novo arquivo já existe: {path}')
        elif path in [*REPLACEMENTS, *PATCHED] and not dest.exists():
            conflicts.append(f'Arquivo de integração ausente: {path}')
        elif dest.exists() and not clean(repo, path):
            conflicts.append(f'Alteração concorrente/staged: {path}')
    if conflicts:
        print('BLOQUEADO — nenhum arquivo será alterado:')
        for item in conflicts: print(' •', item)
        return 4
    print('Arquivos a integrar:')
    for path in targets:
        print(' •', path)
    if not opts.apply:
        print('DRY-RUN: nenhuma alteração aplicada. Use --apply quando não houver conflitos.')
        return 0
    backup = repo / '.check-bouler-backup' / datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    for path, content in targets.items():
        dest = repo / path
        if dest.exists():
            (backup / path).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dest, backup / path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(content, encoding='utf-8')
    print('Integração local aplicada. Backup:', backup)
    print('Validar: npx tsc --noEmit; npx eslint src/components/navigation src/modules/admin/AdminSidebar/index.tsx src/shell/AdminModuleLayout.tsx; npm run build; npx vitest run src/components/navigation/cell-navigation-model.test.ts')
    print('Não faz commit, push, deploy ou operações remotas.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
