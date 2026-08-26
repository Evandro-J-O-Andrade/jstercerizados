export interface Notification {
  id: string;
  tenant_id: string;
  recipient_person_id: string | null;
  channel: string;
  status: string;
  subject: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NotificationDelivery {
  id: string;
  notification_id: string;
  channel: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  person_id: string;
  tenant_id: string;
  channel: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
