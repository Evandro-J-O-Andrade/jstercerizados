const TOKEN_RE = /%([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)%/g;

export function extractTokens(template: string): string[] {
  const out = new Set<string>();
  for (const match of template.matchAll(TOKEN_RE)) {
    out.add(match[1]);
  }
  return Array.from(out);
}

export function getValue(vars: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = vars;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export interface ApplyResult {
  resolved: string;
  missing: string[];
}

export function applyTemplate(
  template: string,
  vars: Record<string, unknown>,
  options: { missing?: 'empty' | 'keep' } = {},
): ApplyResult {
  const { missing: missingMode = 'empty' } = options;
  const missing: string[] = [];
  const resolved = template.replace(TOKEN_RE, (whole, token: string) => {
    const value = getValue(vars, token);
    if (value === undefined || value === null) {
      missing.push(token);
      return missingMode === 'keep' ? whole : '';
    }
    return String(value);
  });
  return { resolved, missing };
}
