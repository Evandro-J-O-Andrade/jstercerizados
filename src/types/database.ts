export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          document: string | null;
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          document?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          document?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          document: string | null;
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          document?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          document?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_memberships: {
        Row: {
          id: string;
          person_id: string;
          tenant_id: string;
          role_id: string | null;
          status: 'active' | 'inactive' | 'pending';
          invited_by: string | null;
          joined_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          tenant_id: string;
          role_id?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          invited_by?: string | null;
          joined_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          role_id?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          invited_by?: string | null;
          joined_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          scope: 'system' | 'tenant';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          scope?: 'system' | 'tenant';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          scope?: 'system' | 'tenant';
          created_at?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          module: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          module?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          module?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      role_assignments: {
        Row: {
          id: string;
          role_id: string;
          person_id: string;
          tenant_id: string | null;
          assigned_by: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          person_id: string;
          tenant_id?: string | null;
          assigned_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          person_id?: string;
          tenant_id?: string | null;
          assigned_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          legal_name: string;
          trading_name: string | null;
          cnpj: string | null;
          cnpj_root: string | null;
          state_registration: string | null;
          municipal_registration: string | null;
          company_type_id: string | null;
          industry: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          linkedin_url: string | null;
          logo_url: string | null;
          address: Record<string, unknown> | null;
          size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise' | null;
          status: 'active' | 'inactive' | 'suspended' | 'pending';
          is_active: boolean;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          legal_name: string;
          trading_name?: string | null;
          cnpj?: string | null;
          cnpj_root?: string | null;
          state_registration?: string | null;
          municipal_registration?: string | null;
          company_type_id?: string | null;
          industry?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          logo_url?: string | null;
          address?: Record<string, unknown> | null;
          size?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise' | null;
          status?: 'active' | 'inactive' | 'suspended' | 'pending';
          is_active?: boolean;
          metadata?: Record<string, unknown>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          legal_name?: string;
          trading_name?: string | null;
          cnpj?: string | null;
          cnpj_root?: string | null;
          state_registration?: string | null;
          municipal_registration?: string | null;
          company_type_id?: string | null;
          industry?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          logo_url?: string | null;
          address?: Record<string, unknown> | null;
          size?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise' | null;
          status?: 'active' | 'inactive' | 'suspended' | 'pending';
          is_active?: boolean;
          metadata?: Record<string, unknown>;
          created_by?: string | null;
        };
      };
      candidates: {
        Row: {
          id: string;
          person_id: string;
          tenant_id: string;
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          tenant_id: string;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_experiences: {
        Row: {
          id: string;
          candidate_id: string;
          company: string;
          position: string;
          start_date: string | null;
          end_date: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          company: string;
          position: string;
          start_date?: string | null;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          company?: string;
          position?: string;
          start_date?: string | null;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_education: {
        Row: {
          id: string;
          candidate_id: string;
          institution: string;
          course: string;
          degree: string | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          institution: string;
          course: string;
          degree?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          institution?: string;
          course?: string;
          degree?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_courses: {
        Row: {
          id: string;
          candidate_id: string;
          name: string;
          institution: string | null;
          hours: number | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          name: string;
          institution?: string | null;
          hours?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          name?: string;
          institution?: string | null;
          hours?: number | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_languages: {
        Row: {
          id: string;
          candidate_id: string;
          language: string;
          level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          language: string;
          level: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          language?: string;
          level?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_documents: {
        Row: {
          id: string;
          candidate_id: string;
          type: string;
          url: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          type: string;
          url: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          type?: string;
          url?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_skills: {
        Row: {
          id: string;
          candidate_id: string;
          skill_id: string | null;
          name: string;
          level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          skill_id?: string | null;
          name: string;
          level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          skill_id?: string | null;
          name?: string;
          level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_profile_views: {
        Row: {
          id: string;
          candidate_id: string;
          viewer_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          tenant_id: string;
          company_relationship_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          responsibilities: string | null;
          requirements: string | null;
          benefits: string | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_type: string | null;
          contract_type: string | null;
          seniority: string | null;
          work_hours: string | null;
          work_mode: string | null;
          city: string | null;
          state: string | null;
          location_detail: string | null;
          status: 'draft' | 'published' | 'archived' | 'hired' | 'expired';
          views_count: number;
          applications_count: number;
          published_at: string | null;
          expires_at: string | null;
          metadata: Record<string, unknown>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          company_relationship_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          responsibilities?: string | null;
          requirements?: string | null;
          benefits?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_type?: string | null;
          contract_type?: string | null;
          seniority?: string | null;
          work_hours?: string | null;
          work_mode?: string | null;
          city?: string | null;
          state?: string | null;
          location_detail?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'hired' | 'expired';
          views_count?: number;
          applications_count?: number;
          published_at?: string | null;
          expires_at?: string | null;
          metadata?: Record<string, unknown>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_relationship_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          responsibilities?: string | null;
          requirements?: string | null;
          benefits?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_type?: string | null;
          contract_type?: string | null;
          seniority?: string | null;
          work_hours?: string | null;
          work_mode?: string | null;
          city?: string | null;
          state?: string | null;
          location_detail?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'hired' | 'expired';
          views_count?: number;
          applications_count?: number;
          published_at?: string | null;
          expires_at?: string | null;
          metadata?: Record<string, unknown>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          status: 'applied' | 'review' | 'interview' | 'approved' | 'rejected';
          cover_letter: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_id: string;
          status?: 'applied' | 'review' | 'interview' | 'approved' | 'rejected';
          cover_letter?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          status?: 'applied' | 'review' | 'interview' | 'approved' | 'rejected';
          cover_letter?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          email: string;
          phone: string | null;
          service_id: string | null;
          status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          email: string;
          phone?: string | null;
          service_id?: string | null;
          status?: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          service_id?: string | null;
          status?: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          tenant_id: string | null;
          slug: string;
          title: string;
          description: string;
          short_description: string;
          benefits: string[];
          image: string;
          gallery: string[] | null;
          icon: string;
          category: 'rh' | 'facilities' | 'terceirizacao' | 'candidato';
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          slug: string;
          title: string;
          description: string;
          short_description: string;
          benefits: string[];
          image: string;
          gallery?: string[] | null;
          icon: string;
          category: 'rh' | 'facilities' | 'terceirizacao' | 'candidato';
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          slug?: string;
          title?: string;
          description?: string;
          short_description?: string;
          benefits?: string[];
          image?: string;
          gallery?: string[] | null;
          icon?: string;
          category?: 'rh' | 'facilities' | 'terceirizacao' | 'candidato';
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          document: string | null;
          products: string | null;
          representative: string | null;
          phone: string | null;
          email: string | null;
          catalog: string | null;
          documents: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          document?: string | null;
          products?: string | null;
          representative?: string | null;
          phone?: string | null;
          email?: string | null;
          catalog?: string | null;
          documents?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          document?: string | null;
          products?: string | null;
          representative?: string | null;
          phone?: string | null;
          email?: string | null;
          catalog?: string | null;
          documents?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      partners: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          document: string | null;
          area: string | null;
          city: string | null;
          state: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          document?: string | null;
          area?: string | null;
          city?: string | null;
          state?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          document?: string | null;
          area?: string | null;
          city?: string | null;
          state?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_requests: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          company: string;
          cnpj: string;
          city: string | null;
          state: string | null;
          email: string;
          phone: string;
          whatsapp: string | null;
          service_id: string | null;
          posts: number;
          message: string | null;
          status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          company: string;
          cnpj: string;
          city?: string | null;
          state?: string | null;
          email: string;
          phone: string;
          whatsapp?: string | null;
          service_id?: string | null;
          posts?: number;
          message?: string | null;
          status?: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          company?: string;
          cnpj?: string;
          city?: string | null;
          state?: string | null;
          email?: string;
          phone?: string;
          whatsapp?: string | null;
          service_id?: string | null;
          posts?: number;
          message?: string | null;
          status?: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
          created_at?: string;
          updated_at?: string;
        };
      };
      recruitment_processes: {
        Row: {
          id: string;
          tenant_id: string;
          job_id: string | null;
          title: string;
          description: string | null;
          status: 'open' | 'closed' | 'draft';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          job_id?: string | null;
          title: string;
          description?: string | null;
          status?: 'open' | 'closed' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          job_id?: string | null;
          title?: string;
          description?: string | null;
          status?: 'open' | 'closed' | 'draft';
          created_at?: string;
          updated_at?: string;
        };
      };
      service_orders: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          title: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_transactions: {
        Row: {
          id: string;
          tenant_id: string;
          description: string;
          category: string | null;
          type: 'income' | 'expense';
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          description: string;
          category?: string | null;
          type: 'income' | 'expense';
          amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          description?: string;
          category?: string | null;
          type?: 'income' | 'expense';
          amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          quantity: number;
          movement_type: 'in' | 'out' | 'adjustment';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          product_id: string;
          quantity: number;
          movement_type: 'in' | 'out' | 'adjustment';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          quantity?: number;
          movement_type?: 'in' | 'out' | 'adjustment';
          created_at?: string;
          updated_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          title: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
      };
      report_definitions: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_settings: {
        Row: {
          id: string;
          tenant_id: string;
          key: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          key: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          key?: string;
          value?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      first_login_state: {
        Row: {
          person_id: string;
          must_change_password: boolean;
          terms_version: string | null;
          privacy_version: string | null;
          lgpd_consent_version: string | null;
          first_login_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          person_id: string;
          must_change_password?: boolean;
          terms_version?: string | null;
          privacy_version?: string | null;
          lgpd_consent_version?: string | null;
          first_login_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          person_id?: string;
          must_change_password?: boolean;
          terms_version?: string | null;
          privacy_version?: string | null;
          lgpd_consent_version?: string | null;
          first_login_completed?: boolean;
          welcome_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      legal_acceptances: {
        Row: {
          id: string;
          person_id: string;
          tenant_id: string;
          document_type: string;
          document_version: string;
          accepted_at: string;
          ip: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          person_id: string;
          tenant_id: string;
          document_type: string;
          document_version: string;
          accepted_at?: string;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          document_type?: string;
          document_version?: string;
          accepted_at?: string;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown>;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      person_status: 'active' | 'inactive' | 'pending';
      tenant_status: 'active' | 'inactive' | 'pending';
      company_status: 'active' | 'inactive' | 'pending';
      candidate_status: 'active' | 'inactive' | 'pending';
      job_status: 'draft' | 'published' | 'archived' | 'hired' | 'expired';
      application_status:
        'applied' | 'review' | 'interview' | 'approved' | 'rejected';
      lead_status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
      service_category: 'rh' | 'facilities' | 'terceirizacao' | 'candidato';
      service_status: 'active' | 'inactive';
      supplier_status: 'active' | 'inactive';
      partner_status: 'pending' | 'approved' | 'rejected';
      budget_status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
    };
  };
}
