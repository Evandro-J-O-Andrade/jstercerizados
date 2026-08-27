export interface SupportTicket {
  id: string;
  tenant_id: string;
  category_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_person_id: string | null;
  sla_due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketCreateInput {
  tenant_id: string;
  category_id: string;
  title: string;
  description: string;
  priority?: string;
  status?: string;
  assignee_person_id?: string | null;
  sla_due_at?: string | null;
}

export interface SupportTicketMessage {
  id: string;
  tenant_id: string;
  ticket_id: string;
  person_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessageCreateInput {
  tenant_id: string;
  ticket_id: string;
  person_id: string;
  content: string;
}

export interface SupportFAQ {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface SupportFAQCreateInput {
  tenant_id: string;
  question: string;
  answer: string;
  category: string;
  is_active?: boolean;
  sort_order?: number | null;
}
