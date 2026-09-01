export const STATUS_COLORS = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  accent: 'bg-accent/10 text-accent',
  outline: 'border border-border bg-transparent text-muted-foreground',
} as const;

export type StatusColorKey = keyof typeof STATUS_COLORS;

export const ROLE_COLORS = {
  admin_master: 'bg-primary/10 text-primary',
  viewer: 'bg-muted text-muted-foreground',
} as const;
