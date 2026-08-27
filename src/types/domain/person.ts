export interface Person {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  document: string | null;
  city: string | null;
  state: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}
