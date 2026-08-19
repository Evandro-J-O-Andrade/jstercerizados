CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  person_id UUID REFERENCES people(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  before JSONB,
  after JSONB,
  ip TEXT,
  user_agent TEXT,
  scope TEXT NOT NULL DEFAULT 'tenant',
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  person_id UUID REFERENCES people(id),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB,
  scope TEXT NOT NULL DEFAULT 'tenant',
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
