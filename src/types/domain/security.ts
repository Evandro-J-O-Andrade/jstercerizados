export interface SecurityEvent {
  id: string;
  person_id: string | null;
  tenant_id: string | null;
  event_type: string;
  ip: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_person_id: string | null;
  tenant_id: string | null;
  scope: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  correlation_id: string | null;
  causation_id: string | null;
  created_at: string;
}

export interface DomainEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  actor_person_id: string | null;
  payload: Record<string, unknown>;
  correlation_id: string | null;
  causation_id: string | null;
  idempotency_key: string | null;
  created_at: string;
}
