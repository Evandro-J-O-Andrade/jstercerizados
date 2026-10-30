/**
 * Permissões da célula de Mídia — CHECK BOULER 24H.
 * Default DENY: nenhuma ação de mídia é liberada sem permissão explícita
 * na cadeia roles → role_permissions → permissions.
 */

export const MIDIA_PERMISSIONS = {
  /** Ver ativos de mídia do tenant */
  midia_read: 'midia.read',
  /** Fazer upload de novos ativos */
  midia_upload: 'midia.upload',
  /** Remover/arquivar ativos */
  midia_delete: 'midia.delete',
  /** Reordenar ativos da galeria */
  midia_reorder: 'midia.reorder',
  /** Definir ativo primário */
  midia_set_primary: 'midia.set_primary',
} as const;

export type MidiaPermissionKey = (typeof MIDIA_PERMISSIONS)[keyof typeof MIDIA_PERMISSIONS];

/**
 * Verifica se o contexto de despacho tem permissão para uma operação de mídia.
 * Usa o hasAnyPermission do Core (default DENY).
 */
export function hasMidiaPermission(
  effectivePermissions: { name: string }[],
  permissionKey: MidiaPermissionKey,
): boolean {
  return effectivePermissions.some(
    (p) => p.name === permissionKey,
  );
}
