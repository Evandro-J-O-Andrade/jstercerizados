export interface SupportTicket {
  id: string;
  tenant_id: string;
  company_id: string | null;
  category_id: string | null;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketCreateInput {
  tenant_id: string;
  company_id?: string | null;
  category_id?: string | null;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  created_by?: string | null;
  assigned_to?: string | null;
}

export interface SupportTicketMessage {
  id: string;
  tenant_id: string;
  ticket_id: string;
  author_id: string | null;
  message: string;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessageCreateInput {
  tenant_id: string;
  ticket_id: string;
  author_id?: string | null;
  message: string;
  attachment_url?: string | null;
}

export interface SupportFAQ {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  category: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SupportFAQCreateInput {
  tenant_id: string;
  question: string;
  answer: string;
  category: string;
  status?: 'active' | 'inactive';
}
