export interface Database {
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string | null;
          supplier_id: string | null;
          purchase_order_id: string | null;
          purchase_receipt_id: string | null;
          description: string;
          amount: number;
          discount: number;
          tax: number;
          net_amount: number;
          due_date: string;
          paid_at: string | null;
          status: string;
          origin_document_type: string | null;
          origin_document_id: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          supplier_id?: string | null;
          purchase_order_id?: string | null;
          purchase_receipt_id?: string | null;
          description?: string;
          amount?: number;
          discount?: number;
          tax?: number;
          net_amount?: number;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          supplier_id?: string | null;
          purchase_order_id?: string | null;
          purchase_receipt_id?: string | null;
          description?: string;
          amount?: number;
          discount?: number;
          tax?: number;
          net_amount?: number;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts_receivable: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string | null;
          contract_id: string | null;
          service_order_id: string | null;
          invoice_id: string | null;
          description: string;
          amount: number;
          discount: number;
          tax: number;
          net_amount: number;
          due_date: string;
          paid_at: string | null;
          status: string;
          origin_document_type: string | null;
          origin_document_id: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          contract_id?: string | null;
          service_order_id?: string | null;
          invoice_id?: string | null;
          description?: string;
          amount?: number;
          discount?: number;
          tax?: number;
          net_amount?: number;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          contract_id?: string | null;
          service_order_id?: string | null;
          invoice_id?: string | null;
          description?: string;
          amount?: number;
          discount?: number;
          tax?: number;
          net_amount?: number;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      administrative_approvals: {
        Row: {
          id: string;
          tenant_id: string;
          task_id: string;
          approver_person_id: string;
          decision: string;
          notes: string | null;
          approved_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          approver_person_id?: string;
          decision?: string;
          notes?: string | null;
          approved_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          approver_person_id?: string;
          decision?: string;
          notes?: string | null;
          approved_at?: string;
          created_at?: string;
        };
      };
      administrative_documents: {
        Row: {
          id: string;
          tenant_id: string;
          request_id: string | null;
          file_id: string | null;
          type: string;
          file_name: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          request_id?: string | null;
          file_id?: string | null;
          type?: string;
          file_name?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          request_id?: string | null;
          file_id?: string | null;
          type?: string;
          file_name?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      administrative_requests: {
        Row: {
          id: string;
          tenant_id: string;
          requester_person_id: string;
          type: string;
          subject: string;
          description: string | null;
          status: string;
          priority: string;
          requested_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          requester_person_id?: string;
          type?: string;
          subject?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          requested_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          requester_person_id?: string;
          type?: string;
          subject?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          requested_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      administrative_tasks: {
        Row: {
          id: string;
          tenant_id: string;
          request_id: string | null;
          assignee_person_id: string | null;
          title: string;
          description: string | null;
          status: string;
          due_at: string | null;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          request_id?: string | null;
          assignee_person_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          due_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          request_id?: string | null;
          assignee_person_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          due_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          tenant_id: string;
          model: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          model?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          model?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          tokens: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          tokens?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          tokens?: number | null;
          created_at?: string;
        };
      };
      ai_usage: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          model: string;
          tokens: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          model?: string;
          tokens?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          model?: string;
          tokens?: number;
          created_at?: string;
        };
      };
      application_profile_snapshots: {
        Row: {
          id: string;
          tenant_id: string;
          application_id: string;
          snapshot: Record<string, unknown>;
          captured_at: string;
          actor_person_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          application_id?: string;
          snapshot?: Record<string, unknown>;
          captured_at?: string;
          actor_person_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          application_id?: string;
          snapshot?: Record<string, unknown>;
          captured_at?: string;
          actor_person_id?: string | null;
          created_at?: string;
        };
      };
      application_status_history: {
        Row: {
          id: string;
          application_id: string;
          status: string;
          changed_at: string;
          actor_person_id: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          application_id?: string;
          status?: string;
          changed_at?: string;
          actor_person_id?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          application_id?: string;
          status?: string;
          changed_at?: string;
          actor_person_id?: string | null;
          metadata?: Record<string, unknown>;
        };
      };
      applications: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
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
        };
        Insert: {
          id?: string;
          actor_person_id?: string | null;
          tenant_id?: string | null;
          scope?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_data?: Record<string, unknown> | null;
          after_data?: Record<string, unknown> | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_person_id?: string | null;
          tenant_id?: string | null;
          scope?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_data?: Record<string, unknown> | null;
          after_data?: Record<string, unknown> | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          created_at?: string;
        };
      };
      automation_executions: {
        Row: {
          id: string;
          tenant_id: string;
          automation_job_id: string;
          event_id: string | null;
          status: string;
          input_data: Record<string, unknown>;
          output_data: Record<string, unknown> | null;
          error_message: string | null;
          started_at: string;
          finished_at: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          automation_job_id?: string;
          event_id?: string | null;
          status?: string;
          input_data?: Record<string, unknown>;
          output_data?: Record<string, unknown> | null;
          error_message?: string | null;
          started_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          automation_job_id?: string;
          event_id?: string | null;
          status?: string;
          input_data?: Record<string, unknown>;
          output_data?: Record<string, unknown> | null;
          error_message?: string | null;
          started_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      automation_jobs: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          trigger_type: string;
          trigger_config: Record<string, unknown>;
          action_type: string;
          action_config: Record<string, unknown>;
          is_active: boolean;
          last_run_at: string | null;
          next_run_at: string | null;
          run_count: number;
          failure_count: number;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          trigger_type?: string;
          trigger_config?: Record<string, unknown>;
          action_type?: string;
          action_config?: Record<string, unknown>;
          is_active?: boolean;
          last_run_at?: string | null;
          next_run_at?: string | null;
          run_count?: number;
          failure_count?: number;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          trigger_type?: string;
          trigger_config?: Record<string, unknown>;
          action_type?: string;
          action_config?: Record<string, unknown>;
          is_active?: boolean;
          last_run_at?: string | null;
          next_run_at?: string | null;
          run_count?: number;
          failure_count?: number;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      automation_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          trigger_type: string;
          payload: Record<string, unknown>;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          trigger_type?: string;
          payload?: Record<string, unknown>;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          trigger_type?: string;
          payload?: Record<string, unknown>;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bank_reconciliations: {
        Row: {
          id: string;
          tenant_id: string;
          bank_account: string;
          statement_date: string;
          statement_balance: number;
          reconciled_balance: number;
          difference: number;
          status: string;
          notes: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          bank_account?: string;
          statement_date?: string;
          statement_balance?: number;
          reconciled_balance?: number;
          difference?: number;
          status?: string;
          notes?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          bank_account?: string;
          statement_date?: string;
          statement_balance?: number;
          reconciled_balance?: number;
          difference?: number;
          status?: string;
          notes?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          tenant_id: string;
          calendar_id: string | null;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string | null;
          all_day: boolean;
          is_busy: boolean;
          location: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          calendar_id?: string | null;
          title?: string;
          description?: string | null;
          start_at?: string;
          end_at?: string | null;
          all_day?: boolean;
          is_busy?: boolean;
          location?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          calendar_id?: string | null;
          title?: string;
          description?: string | null;
          start_at?: string;
          end_at?: string | null;
          all_day?: boolean;
          is_busy?: boolean;
          location?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_integrations: {
        Row: {
          id: string;
          tenant_id: string;
          provider: string;
          status: string;
          config: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          provider?: string;
          status?: string;
          config?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          provider?: string;
          status?: string;
          config?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendars: {
        Row: {
          id: string;
          tenant_id: string;
          integration_id: string | null;
          name: string;
          description: string | null;
          color: string | null;
          is_shared: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          integration_id?: string | null;
          name?: string;
          description?: string | null;
          color?: string | null;
          is_shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          integration_id?: string | null;
          name?: string;
          description?: string | null;
          color?: string | null;
          is_shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_courses: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          name: string;
          institution: string | null;
          completion_date: string | null;
          expiration_date: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          name?: string;
          institution?: string | null;
          completion_date?: string | null;
          expiration_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          name?: string;
          institution?: string | null;
          completion_date?: string | null;
          expiration_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_documents: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          document_type: string;
          file_name: string;
          storage_path: string;
          mime_type: string | null;
          size: number | null;
          uploaded_at: string;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          document_type?: string;
          file_name?: string;
          storage_path?: string;
          mime_type?: string | null;
          size?: number | null;
          uploaded_at?: string;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          document_type?: string;
          file_name?: string;
          storage_path?: string;
          mime_type?: string | null;
          size?: number | null;
          uploaded_at?: string;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_education: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          institution: string;
          course: string;
          degree: string | null;
          start_date: string;
          end_date: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          institution?: string;
          course?: string;
          degree?: string | null;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          institution?: string;
          course?: string;
          degree?: string | null;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_experiences: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          company_name: string;
          role: string;
          start_date: string;
          end_date: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          company_name?: string;
          role?: string;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          company_name?: string;
          role?: string;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_languages: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          language: string;
          proficiency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          language?: string;
          proficiency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          language?: string;
          proficiency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_processes: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          recruitment_process_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          recruitment_process_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          recruitment_process_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_profile_views: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          viewed_by: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          viewed_by?: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          viewed_by?: string;
          viewed_at?: string;
        };
      };
      candidate_skills: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          skill_id: string;
          level: string | null;
          years_used: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          skill_id?: string;
          level?: string | null;
          years_used?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          skill_id?: string;
          level?: string | null;
          years_used?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          person_id: string;
          tenant_id: string;
          status:
            | 'new'
            | 'review'
            | 'interview'
            | 'approved'
            | 'rejected'
            | 'talent_pool'
            | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          status?:
            | 'new'
            | 'review'
            | 'interview'
            | 'approved'
            | 'rejected'
            | 'talent_pool'
            | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          status?:
            | 'new'
            | 'review'
            | 'interview'
            | 'approved'
            | 'rejected'
            | 'talent_pool'
            | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_handoffs: {
        Row: {
          id: string;
          room_id: string;
          from_person_id: string | null;
          to_person_id: string | null;
          reason: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id?: string;
          from_person_id?: string | null;
          to_person_id?: string | null;
          reason?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          from_person_id?: string | null;
          to_person_id?: string | null;
          reason?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          sender_type: string;
          sender_person_id: string | null;
          content: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id?: string;
          sender_type?: string;
          sender_person_id?: string | null;
          content?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          sender_type?: string;
          sender_person_id?: string | null;
          content?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
      chat_participants: {
        Row: {
          id: string;
          room_id: string;
          person_id: string | null;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id?: string;
          person_id?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          person_id?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          tenant_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          legal_name: string | null;
          document: string | null;
          status: 'active' | 'inactive' | 'pending' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          legal_name?: string | null;
          document?: string | null;
          status?: 'active' | 'inactive' | 'pending' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          legal_name?: string | null;
          document?: string | null;
          status?: 'active' | 'inactive' | 'pending' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      company_contacts: {
        Row: {
          id: string;
          company_id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: string | null;
          created_at?: string;
        };
      };
      company_locations: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          name: string;
          address: Record<string, unknown> | null;
          contact_name: string | null;
          contact_phone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          name?: string;
          address?: Record<string, unknown> | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          name?: string;
          address?: Record<string, unknown> | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_relationships: {
        Row: {
          id: string;
          company_id: string;
          relationship_type: string;
          status: string;
          start_date: string | null;
          end_date: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string;
          relationship_type?: string;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          relationship_type?: string;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_services: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          name: string;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      consents: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          purpose: string;
          granted: boolean;
          channel: string | null;
          evidence_url: string | null;
          term_version: string;
          granted_at: string;
          revoked_at: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          causation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          purpose?: string;
          granted?: boolean;
          channel?: string | null;
          evidence_url?: string | null;
          term_version?: string;
          granted_at?: string;
          revoked_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          purpose?: string;
          granted?: boolean;
          channel?: string | null;
          evidence_url?: string | null;
          term_version?: string;
          granted_at?: string;
          revoked_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contract_status_history: {
        Row: {
          id: string;
          tenant_id: string;
          contract_id: string;
          status: string;
          changed_at: string;
          actor_person_id: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          contract_id?: string;
          status?: string;
          changed_at?: string;
          actor_person_id?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          contract_id?: string;
          status?: string;
          changed_at?: string;
          actor_person_id?: string | null;
          metadata?: Record<string, unknown>;
        };
      };
      contracts: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          title: string;
          start_date: string | null;
          end_date: string | null;
          value: number | null;
          payment_terms: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          title?: string;
          start_date?: string | null;
          end_date?: string | null;
          value?: number | null;
          payment_terms?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          title?: string;
          start_date?: string | null;
          end_date?: string | null;
          value?: number | null;
          payment_terms?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cost_centers: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          code: string;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_feedback: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string;
          service_order_id: string | null;
          work_order_id: string | null;
          rating: number;
          comment: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          service_order_id?: string | null;
          work_order_id?: string | null;
          rating?: number;
          comment?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          service_order_id?: string | null;
          work_order_id?: string | null;
          rating?: number;
          comment?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_ratings: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string;
          service_order_id: string | null;
          work_order_id: string | null;
          rating: number;
          comment: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          service_order_id?: string | null;
          work_order_id?: string | null;
          rating?: number;
          comment?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          service_order_id?: string | null;
          work_order_id?: string | null;
          rating?: number;
          comment?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string | null;
          person_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          document: string | null;
          status: string;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          document?: string | null;
          status?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          document?: string | null;
          status?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      dashboard_layouts: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string | null;
          widget_id: string;
          position_x: number;
          position_y: number;
          width: number;
          height: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string | null;
          widget_id?: string;
          position_x?: number;
          position_y?: number;
          width?: number;
          height?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string | null;
          widget_id?: string;
          position_x?: number;
          position_y?: number;
          width?: number;
          height?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      dashboard_widgets: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: string;
          config: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          config?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          config?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      data_deletion_requests: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          status: string;
          reason: string | null;
          anonymized_fields: Record<string, unknown> | null;
          legal_hold: boolean;
          requested_at: string;
          finished_at: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          causation_id: string | null;
          idempotency_key: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          status?: string;
          reason?: string | null;
          anonymized_fields?: Record<string, unknown> | null;
          legal_hold?: boolean;
          requested_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          status?: string;
          reason?: string | null;
          anonymized_fields?: Record<string, unknown> | null;
          legal_hold?: boolean;
          requested_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      data_export_requests: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          status: string;
          file_url: string | null;
          requested_at: string;
          finished_at: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          causation_id: string | null;
          idempotency_key: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          status?: string;
          file_url?: string | null;
          requested_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          status?: string;
          file_url?: string | null;
          requested_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      data_retention_policies: {
        Row: {
          id: string;
          tenant_id: string;
          data_domain: string;
          retention_days: number;
          legal_basis: string | null;
          action_after_expiry: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          data_domain?: string;
          retention_days?: number;
          legal_basis?: string | null;
          action_after_expiry?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          data_domain?: string;
          retention_days?: number;
          legal_basis?: string | null;
          action_after_expiry?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_links: {
        Row: {
          id: string;
          tenant_id: string;
          file_id: string;
          entity_type: string;
          entity_id: string;
          relation_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          file_id?: string;
          entity_type?: string;
          entity_id?: string;
          relation_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          file_id?: string;
          entity_type?: string;
          entity_id?: string;
          relation_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_versions: {
        Row: {
          id: string;
          tenant_id: string;
          entity_type: string;
          entity_id: string;
          version: number;
          storage_path: string;
          bucket: string;
          changed_by_person_id: string | null;
          changed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          entity_type?: string;
          entity_id?: string;
          version?: number;
          storage_path?: string;
          bucket?: string;
          changed_by_person_id?: string | null;
          changed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          entity_type?: string;
          entity_id?: string;
          version?: number;
          storage_path?: string;
          bucket?: string;
          changed_by_person_id?: string | null;
          changed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      domain_events: {
        Row: {
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
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          event_type?: string;
          aggregate_type?: string;
          aggregate_id?: string;
          actor_person_id?: string | null;
          payload?: Record<string, unknown>;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          event_type?: string;
          aggregate_type?: string;
          aggregate_id?: string;
          actor_person_id?: string | null;
          payload?: Record<string, unknown>;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
        };
      };
      email_messages: {
        Row: {
          id: string;
          tenant_id: string;
          template_id: string | null;
          recipient_email: string;
          subject: string | null;
          body_html: string | null;
          body_text: string | null;
          status: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          template_id?: string | null;
          recipient_email?: string;
          subject?: string | null;
          body_html?: string | null;
          body_text?: string | null;
          status?: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          template_id?: string | null;
          recipient_email?: string;
          subject?: string | null;
          body_html?: string | null;
          body_text?: string | null;
          status?: string;
          sent_at?: string | null;
          created_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          subject: string | null;
          body_html: string | null;
          body_text: string | null;
          variables: Record<string, unknown> | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          subject?: string | null;
          body_html?: string | null;
          body_text?: string | null;
          variables?: Record<string, unknown> | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          subject?: string | null;
          body_html?: string | null;
          body_text?: string | null;
          variables?: Record<string, unknown> | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      employee_contracts: {
        Row: {
          id: string;
          employee_id: string;
          contract_type: string;
          start_date: string;
          end_date: string | null;
          salary: number | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id?: string;
          contract_type?: string;
          start_date?: string;
          end_date?: string | null;
          salary?: number | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          contract_type?: string;
          start_date?: string;
          end_date?: string | null;
          salary?: number | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employee_documents: {
        Row: {
          id: string;
          employee_id: string;
          document_type: string;
          file_url: string;
          issue_date: string | null;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id?: string;
          document_type?: string;
          file_url?: string;
          issue_date?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          document_type?: string;
          file_url?: string;
          issue_date?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employee_positions: {
        Row: {
          id: string;
          employee_id: string;
          position_id: string;
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id?: string;
          position_id?: string;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          position_id?: string;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employee_status_history: {
        Row: {
          id: string;
          employee_id: string;
          status: string;
          start_date: string;
          end_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id?: string;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          tenant_id: string;
          employee_code: string;
          hire_date: string;
          termination_date: string | null;
          salary: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          employee_code?: string;
          hire_date?: string;
          termination_date?: string | null;
          salary?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          employee_code?: string;
          hire_date?: string;
          termination_date?: string | null;
          salary?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      epi_deliveries: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          work_order_id: string | null;
          delivery_number: string;
          reason: string | null;
          delivered_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          employee_id?: string;
          work_order_id?: string | null;
          delivery_number?: string;
          reason?: string | null;
          delivered_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          employee_id?: string;
          work_order_id?: string | null;
          delivery_number?: string;
          reason?: string | null;
          delivered_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      epi_delivery_items: {
        Row: {
          id: string;
          tenant_id: string;
          epi_delivery_id: string;
          product_id: string;
          stock_lot_id: string | null;
          quantity: number;
          size: string | null;
          serial_number: string | null;
          condition: string;
          employee_acknowledgement: boolean;
          signature: string | null;
          document_id: string | null;
          returned_at: string | null;
          return_condition: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          epi_delivery_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          quantity?: number;
          size?: string | null;
          serial_number?: string | null;
          condition?: string;
          employee_acknowledgement?: boolean;
          signature?: string | null;
          document_id?: string | null;
          returned_at?: string | null;
          return_condition?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          epi_delivery_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          quantity?: number;
          size?: string | null;
          serial_number?: string | null;
          condition?: string;
          employee_acknowledgement?: boolean;
          signature?: string | null;
          document_id?: string | null;
          returned_at?: string | null;
          return_condition?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      epi_return_items: {
        Row: {
          id: string;
          tenant_id: string;
          epi_return_id: string;
          product_id: string;
          stock_lot_id: string | null;
          quantity: number;
          condition: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          epi_return_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          quantity?: number;
          condition?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          epi_return_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          quantity?: number;
          condition?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      epi_returns: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          work_order_id: string | null;
          return_number: string;
          received_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          employee_id?: string;
          work_order_id?: string | null;
          return_number?: string;
          received_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          employee_id?: string;
          work_order_id?: string | null;
          return_number?: string;
          received_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_deliveries: {
        Row: {
          id: string;
          tenant_id: string;
          outbox_id: string;
          destination: string;
          status: string;
          actor_person_id: string | null;
          correlation_id: string | null;
          idempotency_key: string | null;
          request_payload: Record<string, unknown> | null;
          response_payload: Record<string, unknown> | null;
          attempts: number;
          sent_at: string | null;
          failed_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          outbox_id?: string;
          destination?: string;
          status?: string;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          idempotency_key?: string | null;
          request_payload?: Record<string, unknown> | null;
          response_payload?: Record<string, unknown> | null;
          attempts?: number;
          sent_at?: string | null;
          failed_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          outbox_id?: string;
          destination?: string;
          status?: string;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          idempotency_key?: string | null;
          request_payload?: Record<string, unknown> | null;
          response_payload?: Record<string, unknown> | null;
          attempts?: number;
          sent_at?: string | null;
          failed_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_outbox: {
        Row: {
          id: string;
          tenant_id: string;
          event_id: string;
          status: string;
          attempts: number;
          correlation_id: string | null;
          available_at: string;
          processed_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          event_id?: string;
          status?: string;
          attempts?: number;
          correlation_id?: string | null;
          available_at?: string;
          processed_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          event_id?: string;
          status?: string;
          attempts?: number;
          correlation_id?: string | null;
          available_at?: string;
          processed_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          person_id: string;
          role: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string;
          person_id?: string;
          role?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          person_id?: string;
          role?: string;
          status?: string;
          created_at?: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          tenant_id: string;
          question: string;
          answer: string;
          category: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          question?: string;
          answer?: string;
          category?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          question?: string;
          answer?: string;
          category?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          tenant_id: string;
          entity_type: string;
          entity_id: string;
          person_id: string | null;
          rating: number | null;
          comment: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          entity_type?: string;
          entity_id?: string;
          person_id?: string | null;
          rating?: number | null;
          comment?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          entity_type?: string;
          entity_id?: string;
          person_id?: string | null;
          rating?: number | null;
          comment?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      file_access_logs: {
        Row: {
          id: string;
          tenant_id: string;
          file_id: string;
          person_id: string | null;
          action: string;
          ip: string | null;
          user_agent: string | null;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          file_id?: string;
          person_id?: string | null;
          action?: string;
          ip?: string | null;
          user_agent?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          file_id?: string;
          person_id?: string | null;
          action?: string;
          ip?: string | null;
          user_agent?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          tenant_id: string;
          uploaded_by_person_id: string;
          entity_type: string | null;
          entity_id: string | null;
          file_name: string;
          mime_type: string | null;
          size: number | null;
          storage_path: string;
          bucket: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          uploaded_by_person_id?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          file_name?: string;
          mime_type?: string | null;
          size?: number | null;
          storage_path?: string;
          bucket?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          uploaded_by_person_id?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          file_name?: string;
          mime_type?: string | null;
          size?: number | null;
          storage_path?: string;
          bucket?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_accounts: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          bank: string | null;
          agency: string | null;
          account_number: string | null;
          account_type: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          bank?: string | null;
          agency?: string | null;
          account_number?: string | null;
          account_type?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          bank?: string | null;
          agency?: string | null;
          account_number?: string | null;
          account_type?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: string;
          parent_id: string | null;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          parent_id?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          parent_id?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_installment_cancellations: {
        Row: {
          id: string;
          tenant_id: string;
          installment_id: string;
          reason: string;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          installment_id?: string;
          reason?: string;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          installment_id?: string;
          reason?: string;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_installment_payments: {
        Row: {
          id: string;
          tenant_id: string;
          installment_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          reference: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          installment_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          reference?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          installment_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          reference?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_installments: {
        Row: {
          id: string;
          tenant_id: string;
          account_receivable_id: string | null;
          account_payable_id: string | null;
          installment_number: number;
          total_installments: number;
          amount: number;
          due_date: string;
          paid_at: string | null;
          status: string;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          account_receivable_id?: string | null;
          account_payable_id?: string | null;
          installment_number?: number;
          total_installments?: number;
          amount?: number;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          account_receivable_id?: string | null;
          account_payable_id?: string | null;
          installment_number?: number;
          total_installments?: number;
          amount?: number;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_kpis: {
        Row: {
          tenant_id: string | null;
          total_credit: number | null;
          total_debit: number | null;
          balance: number | null;
        };
        Insert: {
          tenant_id?: string | null;
          total_credit?: number | null;
          total_debit?: number | null;
          balance?: number | null;
        };
        Update: {
          tenant_id?: string | null;
          total_credit?: number | null;
          total_debit?: number | null;
          balance?: number | null;
        };
      };
      financial_transactions: {
        Row: {
          id: string;
          tenant_id: string;
          cost_center_id: string;
          category_id: string | null;
          type: string;
          amount: number;
          competence_date: string;
          payment_date: string | null;
          bank_account: string | null;
          description: string;
          reference: string | null;
          origin_document_type: string | null;
          origin_document_id: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          cost_center_id?: string;
          category_id?: string | null;
          type?: string;
          amount?: number;
          competence_date?: string;
          payment_date?: string | null;
          bank_account?: string | null;
          description?: string;
          reference?: string | null;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          cost_center_id?: string;
          category_id?: string | null;
          type?: string;
          amount?: number;
          competence_date?: string;
          payment_date?: string | null;
          bank_account?: string | null;
          description?: string;
          reference?: string | null;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
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
          welcome_completed_at: string | null;
        };
        Insert: {
          person_id?: string;
          must_change_password?: boolean;
          terms_version?: string | null;
          privacy_version?: string | null;
          lgpd_consent_version?: string | null;
          first_login_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          welcome_completed_at?: string | null;
        };
        Update: {
          person_id?: string;
          must_change_password?: boolean;
          terms_version?: string | null;
          privacy_version?: string | null;
          lgpd_consent_version?: string | null;
          first_login_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          welcome_completed_at?: string | null;
        };
      };
      fiscal_api_requests: {
        Row: {
          id: string;
          tenant_id: string;
          fiscal_document_id: string | null;
          operation: string;
          request_url: string;
          request_headers: Record<string, unknown>;
          request_body: Record<string, unknown>;
          response_status: number | null;
          response_headers: Record<string, unknown>;
          response_body: Record<string, unknown>;
          error_message: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string | null;
          operation?: string;
          request_url?: string;
          request_headers?: Record<string, unknown>;
          request_body?: Record<string, unknown>;
          response_status?: number | null;
          response_headers?: Record<string, unknown>;
          response_body?: Record<string, unknown>;
          error_message?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string | null;
          operation?: string;
          request_url?: string;
          request_headers?: Record<string, unknown>;
          request_body?: Record<string, unknown>;
          response_status?: number | null;
          response_headers?: Record<string, unknown>;
          response_body?: Record<string, unknown>;
          error_message?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fiscal_api_responses: {
        Row: {
          id: string;
          tenant_id: string;
          fiscal_api_request_id: string;
          status: string;
          protocol: string | null;
          receipt: string | null;
          xml_content: string | null;
          pdf_url: string | null;
          error_code: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          fiscal_api_request_id?: string;
          status?: string;
          protocol?: string | null;
          receipt?: string | null;
          xml_content?: string | null;
          pdf_url?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          fiscal_api_request_id?: string;
          status?: string;
          protocol?: string | null;
          receipt?: string | null;
          xml_content?: string | null;
          pdf_url?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fiscal_configurations: {
        Row: {
          id: string;
          tenant_id: string;
          regime_tributario: string;
          ambiente: string;
          serie_nf: string | null;
          serie_nfce: string | null;
          ultimo_numero_nf: number;
          ultimo_numero_nfce: number;
          certificado_digital: string | null;
          senha_certificado: string | null;
          webservice_url: string | null;
          timeout: number;
          status: string;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          regime_tributario?: string;
          ambiente?: string;
          serie_nf?: string | null;
          serie_nfce?: string | null;
          ultimo_numero_nf?: number;
          ultimo_numero_nfce?: number;
          certificado_digital?: string | null;
          senha_certificado?: string | null;
          webservice_url?: string | null;
          timeout?: number;
          status?: string;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          regime_tributario?: string;
          ambiente?: string;
          serie_nf?: string | null;
          serie_nfce?: string | null;
          ultimo_numero_nf?: number;
          ultimo_numero_nfce?: number;
          certificado_digital?: string | null;
          senha_certificado?: string | null;
          webservice_url?: string | null;
          timeout?: number;
          status?: string;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fiscal_document_events: {
        Row: {
          id: string;
          tenant_id: string;
          fiscal_document_id: string;
          event_type: string;
          description: string | null;
          metadata: Record<string, unknown>;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string;
          event_type?: string;
          description?: string | null;
          metadata?: Record<string, unknown>;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string;
          event_type?: string;
          description?: string | null;
          metadata?: Record<string, unknown>;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
        };
      };
      fiscal_document_items: {
        Row: {
          id: string;
          tenant_id: string;
          fiscal_document_id: string;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          discount: number;
          total: number;
          tax_icms: number;
          tax_ipi: number;
          tax_pis: number;
          tax_cofins: number;
          tax_iss: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          total?: number;
          tax_icms?: number;
          tax_ipi?: number;
          tax_pis?: number;
          tax_cofins?: number;
          tax_iss?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          total?: number;
          tax_icms?: number;
          tax_ipi?: number;
          tax_pis?: number;
          tax_cofins?: number;
          tax_iss?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      fiscal_document_status_history: {
        Row: {
          id: string;
          tenant_id: string;
          fiscal_document_id: string;
          status: string;
          reason: string | null;
          actor_person_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string;
          status?: string;
          reason?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          fiscal_document_id?: string;
          status?: string;
          reason?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
        };
      };
      fiscal_documents: {
        Row: {
          id: string;
          tenant_id: string;
          type: string;
          serie: string;
          number: string;
          key: string | null;
          status: string;
          issued_at: string | null;
          authorized_at: string | null;
          cancelled_at: string | null;
          rejection_reason: string | null;
          xml_content: string | null;
          pdf_url: string | null;
          origin_document_type: string | null;
          origin_document_id: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          type?: string;
          serie?: string;
          number?: string;
          key?: string | null;
          status?: string;
          issued_at?: string | null;
          authorized_at?: string | null;
          cancelled_at?: string | null;
          rejection_reason?: string | null;
          xml_content?: string | null;
          pdf_url?: string | null;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          type?: string;
          serie?: string;
          number?: string;
          key?: string | null;
          status?: string;
          issued_at?: string | null;
          authorized_at?: string | null;
          cancelled_at?: string | null;
          rejection_reason?: string | null;
          xml_content?: string | null;
          pdf_url?: string | null;
          origin_document_type?: string | null;
          origin_document_id?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fiscal_integrations: {
        Row: {
          id: string;
          tenant_id: string;
          provider: string;
          api_key: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          provider?: string;
          api_key?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          provider?: string;
          api_key?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      integration_sync_jobs: {
        Row: {
          id: string;
          tenant_id: string;
          provider: string;
          last_sync_at: string | null;
          status: string;
          config: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          provider?: string;
          last_sync_at?: string | null;
          status?: string;
          config?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          provider?: string;
          last_sync_at?: string | null;
          status?: string;
          config?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string | null;
          person_id: string | null;
          type: string;
          direction: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          type?: string;
          direction?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          type?: string;
          direction?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      interview_feedback: {
        Row: {
          id: string;
          tenant_id: string;
          interview_id: string;
          participant_id: string;
          rating: number | null;
          comments: string | null;
          recommendation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          interview_id?: string;
          participant_id?: string;
          rating?: number | null;
          comments?: string | null;
          recommendation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          interview_id?: string;
          participant_id?: string;
          rating?: number | null;
          comments?: string | null;
          recommendation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interview_participants: {
        Row: {
          id: string;
          tenant_id: string;
          interview_id: string;
          person_id: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          interview_id?: string;
          person_id?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          interview_id?: string;
          person_id?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          application_id: string;
          scheduled_at: string | null;
          type: string | null;
          location: string | null;
          status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
          evaluation: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id?: string;
          scheduled_at?: string | null;
          type?: string | null;
          location?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
          evaluation?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          scheduled_at?: string | null;
          type?: string | null;
          location?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
          evaluation?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          tenant_id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          tenant_id: string;
          number: string;
          company_id: string | null;
          customer_id: string | null;
          issue_date: string;
          due_date: string;
          amount: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          number?: string;
          company_id?: string | null;
          customer_id?: string | null;
          issue_date?: string;
          due_date?: string;
          amount?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          number?: string;
          company_id?: string | null;
          customer_id?: string | null;
          issue_date?: string;
          due_date?: string;
          amount?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_matches: {
        Row: {
          id: string;
          tenant_id: string;
          candidate_id: string;
          demand_id: string;
          score: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          demand_id?: string;
          score?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          candidate_id?: string;
          demand_id?: string;
          score?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_skills: {
        Row: {
          id: string;
          tenant_id: string;
          job_id: string;
          skill_id: string;
          required: boolean;
          level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          job_id?: string;
          skill_id?: string;
          required?: boolean;
          level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          job_id?: string;
          skill_id?: string;
          required?: boolean;
          level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string | null;
          title: string;
          description: string | null;
          status: 'draft' | 'active' | 'archived' | 'filled';
          employment_type:
            | 'temporary'
            | 'effective'
            | 'internship'
            | 'apprentice'
            | 'freelance'
            | 'third_party'
            | null;
          location: string | null;
          salary: string | null;
          benefits: string | null;
          requirements: string | null;
          published_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          title?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'archived' | 'filled';
          employment_type?:
            | 'temporary'
            | 'effective'
            | 'internship'
            | 'apprentice'
            | 'freelance'
            | 'third_party'
            | null;
          location?: string | null;
          salary?: string | null;
          benefits?: string | null;
          requirements?: string | null;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          title?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'archived' | 'filled';
          employment_type?:
            | 'temporary'
            | 'effective'
            | 'internship'
            | 'apprentice'
            | 'freelance'
            | 'third_party'
            | null;
          location?: string | null;
          salary?: string | null;
          benefits?: string | null;
          requirements?: string | null;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string | null;
          person_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          source: string | null;
          status:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'proposal_sent'
            | 'converted'
            | 'discarded';
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          status?:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'proposal_sent'
            | 'converted'
            | 'discarded';
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          status?:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'proposal_sent'
            | 'converted'
            | 'discarded';
          metadata?: Record<string, unknown>;
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
          actor_person_id: string | null;
          correlation_id: string | null;
          causation_id: string | null;
        };
        Insert: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          document_type?: string;
          document_version?: string;
          accepted_at?: string;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown>;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
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
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
        };
      };
      material_issue_items: {
        Row: {
          id: string;
          tenant_id: string;
          material_issue_id: string;
          product_id: string;
          stock_lot_id: string | null;
          warehouse_location_id: string | null;
          quantity: number;
          unit_cost: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          material_issue_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          warehouse_location_id?: string | null;
          quantity?: number;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          material_issue_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          warehouse_location_id?: string | null;
          quantity?: number;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      material_issues: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string | null;
          employee_id: string | null;
          warehouse_id: string | null;
          issue_number: string;
          status: string;
          issued_at: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string | null;
          employee_id?: string | null;
          warehouse_id?: string | null;
          issue_number?: string;
          status?: string;
          issued_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string | null;
          employee_id?: string | null;
          warehouse_id?: string | null;
          issue_number?: string;
          status?: string;
          issued_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      material_return_items: {
        Row: {
          id: string;
          tenant_id: string;
          material_return_id: string;
          product_id: string;
          stock_lot_id: string | null;
          warehouse_location_id: string | null;
          quantity: number;
          condition: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          material_return_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          warehouse_location_id?: string | null;
          quantity?: number;
          condition?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          material_return_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          warehouse_location_id?: string | null;
          quantity?: number;
          condition?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      material_returns: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string | null;
          employee_id: string | null;
          warehouse_id: string | null;
          return_number: string;
          status: string;
          received_at: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string | null;
          employee_id?: string | null;
          warehouse_id?: string | null;
          return_number?: string;
          status?: string;
          received_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string | null;
          employee_id?: string | null;
          warehouse_id?: string | null;
          return_number?: string;
          status?: string;
          received_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      meeting_room_reservations: {
        Row: {
          id: string;
          tenant_id: string;
          room_id: string;
          title: string;
          start_at: string;
          end_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          room_id?: string;
          title?: string;
          start_at?: string;
          end_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          room_id?: string;
          title?: string;
          start_at?: string;
          end_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      meeting_rooms: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          capacity: number | null;
          location: string | null;
          amenities: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          capacity?: number | null;
          location?: string | null;
          amenities?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          capacity?: number | null;
          location?: string | null;
          amenities?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_deliveries: {
        Row: {
          id: string;
          tenant_id: string;
          notification_id: string;
          channel: string;
          status: string;
          attempts: number;
          actor_person_id: string | null;
          correlation_id: string | null;
          idempotency_key: string | null;
          sent_at: string | null;
          failed_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          notification_id?: string;
          channel?: string;
          status?: string;
          attempts?: number;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          idempotency_key?: string | null;
          sent_at?: string | null;
          failed_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          notification_id?: string;
          channel?: string;
          status?: string;
          attempts?: number;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          idempotency_key?: string | null;
          sent_at?: string | null;
          failed_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          channel: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          channel?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          channel?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
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
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          recipient_person_id?: string | null;
          channel?: string;
          status?: string;
          subject?: string | null;
          body?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          recipient_person_id?: string | null;
          channel?: string;
          status?: string;
          subject?: string | null;
          body?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      password_policies: {
        Row: {
          id: string;
          tenant_id: string;
          min_length: number;
          require_uppercase: boolean;
          require_lowercase: boolean;
          require_number: boolean;
          require_special: boolean;
          expiration_days: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          min_length?: number;
          require_uppercase?: boolean;
          require_lowercase?: boolean;
          require_number?: boolean;
          require_special?: boolean;
          expiration_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          min_length?: number;
          require_uppercase?: boolean;
          require_lowercase?: boolean;
          require_number?: boolean;
          require_special?: boolean;
          expiration_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          tenant_id: string;
          account_payable_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          reference: string | null;
          bank_account: string | null;
          notes: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          account_payable_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          reference?: string | null;
          bank_account?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          account_payable_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          reference?: string | null;
          bank_account?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          resource: string;
          action: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource?: string;
          action?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          resource?: string;
          action?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      pos_cancellations: {
        Row: {
          id: string;
          tenant_id: string;
          sale_id: string;
          requested_by: string;
          approved_by: string | null;
          reason: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          requested_by?: string;
          approved_by?: string | null;
          reason?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          requested_by?: string;
          approved_by?: string | null;
          reason?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_cash_movements: {
        Row: {
          id: string;
          tenant_id: string;
          session_id: string;
          type: string;
          amount: number;
          reason: string | null;
          approved_by: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          type?: string;
          amount?: number;
          reason?: string | null;
          approved_by?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          type?: string;
          amount?: number;
          reason?: string | null;
          approved_by?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_cashier_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          cashier_id: string;
          operator_id: string;
          opened_at: string;
          closed_at: string | null;
          opening_amount: number;
          closing_amount: number | null;
          expected_amount: number | null;
          difference: number | null;
          status: string;
          notes: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          cashier_id?: string;
          operator_id?: string;
          opened_at?: string;
          closed_at?: string | null;
          opening_amount?: number;
          closing_amount?: number | null;
          expected_amount?: number | null;
          difference?: number | null;
          status?: string;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          cashier_id?: string;
          operator_id?: string;
          opened_at?: string;
          closed_at?: string | null;
          opening_amount?: number;
          closing_amount?: number | null;
          expected_amount?: number | null;
          difference?: number | null;
          status?: string;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_cashiers: {
        Row: {
          id: string;
          tenant_id: string;
          terminal_id: string;
          name: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          terminal_id?: string;
          name?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          terminal_id?: string;
          name?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_daily_closures: {
        Row: {
          id: string;
          tenant_id: string;
          session_id: string;
          closure_date: string;
          expected_amount: number;
          actual_amount: number;
          difference: number;
          status: string;
          notes: string | null;
          approved_by: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          closure_date?: string;
          expected_amount?: number;
          actual_amount?: number;
          difference?: number;
          status?: string;
          notes?: string | null;
          approved_by?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          closure_date?: string;
          expected_amount?: number;
          actual_amount?: number;
          difference?: number;
          status?: string;
          notes?: string | null;
          approved_by?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_operators: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          cashier_id: string;
          pin: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          cashier_id?: string;
          pin?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          cashier_id?: string;
          pin?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_payments: {
        Row: {
          id: string;
          tenant_id: string;
          sale_id: string;
          amount: number;
          payment_method: string;
          status: string;
          confirmed_at: string | null;
          failed_at: string | null;
          failure_reason: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          amount?: number;
          payment_method?: string;
          status?: string;
          confirmed_at?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          amount?: number;
          payment_method?: string;
          status?: string;
          confirmed_at?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_returns: {
        Row: {
          id: string;
          tenant_id: string;
          sale_id: string;
          reason: string;
          status: string;
          received_at: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          reason?: string;
          status?: string;
          received_at?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          reason?: string;
          status?: string;
          received_at?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_sale_items: {
        Row: {
          id: string;
          tenant_id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          discount: number;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_sales: {
        Row: {
          id: string;
          tenant_id: string;
          session_id: string;
          operator_id: string;
          number: string;
          subtotal: number;
          discount: number;
          total: number;
          status: string;
          confirmed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          operator_id?: string;
          number?: string;
          subtotal?: number;
          discount?: number;
          total?: number;
          status?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          operator_id?: string;
          number?: string;
          subtotal?: number;
          discount?: number;
          total?: number;
          status?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pos_terminals: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          serial_number: string | null;
          model: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          serial_number?: string | null;
          model?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          serial_number?: string | null;
          model?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      positions: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          department_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      privacy_requests: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          type: string;
          status: string;
          requested_at: string;
          finished_at: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          causation_id: string | null;
          idempotency_key: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          type?: string;
          status?: string;
          requested_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          type?: string;
          status?: string;
          requested_at?: string;
          finished_at?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          idempotency_key?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          unit: string | null;
          category: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          unit?: string | null;
          category?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          unit?: string | null;
          category?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_order_items: {
        Row: {
          id: string;
          tenant_id: string;
          purchase_order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          received_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          purchase_order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          received_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          purchase_order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          received_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_orders: {
        Row: {
          id: string;
          tenant_id: string;
          supplier_id: string;
          number: string;
          status: string;
          order_date: string | null;
          expected_delivery_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          supplier_id?: string;
          number?: string;
          status?: string;
          order_date?: string | null;
          expected_delivery_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          supplier_id?: string;
          number?: string;
          status?: string;
          order_date?: string | null;
          expected_delivery_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_quotation_items: {
        Row: {
          id: string;
          tenant_id: string;
          quotation_id: string;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          quotation_id?: string;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          quotation_id?: string;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_quotations: {
        Row: {
          id: string;
          tenant_id: string;
          request_id: string;
          supplier_id: string;
          total_value: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          request_id?: string;
          supplier_id?: string;
          total_value?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          request_id?: string;
          supplier_id?: string;
          total_value?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_receipt_divergences: {
        Row: {
          id: string;
          tenant_id: string;
          purchase_receipt_id: string;
          item_id: string;
          expected_quantity: number;
          received_quantity: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          purchase_receipt_id?: string;
          item_id?: string;
          expected_quantity?: number;
          received_quantity?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          purchase_receipt_id?: string;
          item_id?: string;
          expected_quantity?: number;
          received_quantity?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      purchase_receipt_items: {
        Row: {
          id: string;
          tenant_id: string;
          receipt_id: string;
          purchase_order_item_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          receipt_id?: string;
          purchase_order_item_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          receipt_id?: string;
          purchase_order_item_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      purchase_receipts: {
        Row: {
          id: string;
          tenant_id: string;
          purchase_order_id: string;
          supplier_id: string;
          received_at: string;
          status: string;
          notes: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          purchase_order_id?: string;
          supplier_id?: string;
          received_at?: string;
          status?: string;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          purchase_order_id?: string;
          supplier_id?: string;
          received_at?: string;
          status?: string;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_request_items: {
        Row: {
          id: string;
          tenant_id: string;
          request_id: string;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          request_id?: string;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          request_id?: string;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_requests: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          requester_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          requester_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          requester_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_status_history: {
        Row: {
          id: string;
          tenant_id: string;
          purchase_order_id: string;
          status: string;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          purchase_order_id?: string;
          status?: string;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          purchase_order_id?: string;
          status?: string;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      quote_items: {
        Row: {
          id: string;
          tenant_id: string;
          quote_id: string;
          service_id: string | null;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          discount: number;
          tax: number;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          quote_id?: string;
          service_id?: string | null;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          tax?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          quote_id?: string;
          service_id?: string | null;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          tax?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string;
          company_id: string | null;
          person_id: string | null;
          quote_number: string;
          status: string;
          issue_date: string;
          valid_until: string | null;
          discount: number;
          tax: number;
          total: number;
          notes: string | null;
          version: number;
          parent_quote_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          quote_number?: string;
          status?: string;
          issue_date?: string;
          valid_until?: string | null;
          discount?: number;
          tax?: number;
          total?: number;
          notes?: string | null;
          version?: number;
          parent_quote_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          quote_number?: string;
          status?: string;
          issue_date?: string;
          valid_until?: string | null;
          discount?: number;
          tax?: number;
          total?: number;
          notes?: string | null;
          version?: number;
          parent_quote_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      receipts: {
        Row: {
          id: string;
          tenant_id: string;
          account_receivable_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          reference: string | null;
          bank_account: string | null;
          notes: string | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          account_receivable_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          reference?: string | null;
          bank_account?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          account_receivable_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          reference?: string | null;
          bank_account?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recruitment_demands: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          position: string;
          quantity: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          position?: string;
          quantity?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          position?: string;
          quantity?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      recruitment_kpis: {
        Row: {
          tenant_id: string | null;
          open_demands: number | null;
          closed_demands: number | null;
          total_demands: number | null;
        };
        Insert: {
          tenant_id?: string | null;
          open_demands?: number | null;
          closed_demands?: number | null;
          total_demands?: number | null;
        };
        Update: {
          tenant_id?: string | null;
          open_demands?: number | null;
          closed_demands?: number | null;
          total_demands?: number | null;
        };
      };
      recruitment_processes: {
        Row: {
          id: string;
          tenant_id: string;
          job_id: string;
          candidate_id: string;
          status: 'open' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
          opened_at: string;
          closed_at: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          job_id?: string;
          candidate_id?: string;
          status?:
            'open' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
          opened_at?: string;
          closed_at?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          job_id?: string;
          candidate_id?: string;
          status?:
            'open' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
          opened_at?: string;
          closed_at?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recruitment_stages: {
        Row: {
          id: string;
          tenant_id: string;
          recruitment_process_id: string;
          stage_template_id: string;
          status: string;
          started_at: string | null;
          completed_at: string | null;
          notes: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          recruitment_process_id?: string;
          stage_template_id?: string;
          status?: string;
          started_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          recruitment_process_id?: string;
          stage_template_id?: string;
          status?: string;
          started_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      report_definitions: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          query: string;
          parameters: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          query?: string;
          parameters?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          query?: string;
          parameters?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      report_executions: {
        Row: {
          id: string;
          tenant_id: string;
          report_id: string;
          executed_by: string | null;
          result: Record<string, unknown> | null;
          executed_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          report_id?: string;
          executed_by?: string | null;
          result?: Record<string, unknown> | null;
          executed_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          report_id?: string;
          executed_by?: string | null;
          result?: Record<string, unknown> | null;
          executed_at?: string;
        };
      };
      report_schedules: {
        Row: {
          id: string;
          tenant_id: string;
          report_id: string;
          cron: string;
          recipients: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          report_id?: string;
          cron?: string;
          recipients?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          report_id?: string;
          cron?: string;
          recipients?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      role_assignments: {
        Row: {
          id: string;
          person_id: string;
          role_id: string;
          tenant_id: string | null;
          assigned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id?: string;
          role_id?: string;
          tenant_id?: string | null;
          assigned_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          role_id?: string;
          tenant_id?: string | null;
          assigned_at?: string;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          scope: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          description?: string | null;
          scope?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          scope?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          tenant_id: string;
          sale_id: string;
          quote_item_id: string | null;
          service_id: string | null;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          discount: number;
          tax: number;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          quote_item_id?: string | null;
          service_id?: string | null;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          tax?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sale_id?: string;
          quote_item_id?: string | null;
          service_id?: string | null;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          tax?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string;
          company_id: string | null;
          person_id: string | null;
          quote_id: string | null;
          sale_number: string;
          status: string;
          issue_date: string;
          discount: number;
          tax: number;
          total: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          quote_id?: string | null;
          sale_number?: string;
          status?: string;
          issue_date?: string;
          discount?: number;
          tax?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          company_id?: string | null;
          person_id?: string | null;
          quote_id?: string | null;
          sale_number?: string;
          status?: string;
          issue_date?: string;
          discount?: number;
          tax?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      security_events: {
        Row: {
          id: string;
          person_id: string | null;
          tenant_id: string | null;
          event_type: string;
          ip: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id?: string | null;
          tenant_id?: string | null;
          event_type?: string;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string | null;
          tenant_id?: string | null;
          event_type?: string;
          ip?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
      service_acceptances: {
        Row: {
          id: string;
          tenant_id: string;
          service_order_id: string;
          accepted_by: string | null;
          accepted_at: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          accepted_by?: string | null;
          accepted_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          accepted_by?: string | null;
          accepted_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_attachments: {
        Row: {
          id: string;
          tenant_id: string;
          service_order_id: string;
          file_url: string;
          file_name: string;
          mime_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          file_url?: string;
          file_name?: string;
          mime_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          file_url?: string;
          file_name?: string;
          mime_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      service_executions: {
        Row: {
          id: string;
          tenant_id: string;
          service_order_id: string;
          executed_by: string | null;
          started_at: string;
          finished_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          executed_by?: string | null;
          started_at?: string;
          finished_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          executed_by?: string | null;
          started_at?: string;
          finished_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_occurrences: {
        Row: {
          id: string;
          tenant_id: string;
          service_order_id: string | null;
          work_order_id: string | null;
          occurrence_type: string;
          description: string;
          severity: string;
          reported_by: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string | null;
          work_order_id?: string | null;
          occurrence_type?: string;
          description?: string;
          severity?: string;
          reported_by?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string | null;
          work_order_id?: string | null;
          occurrence_type?: string;
          description?: string;
          severity?: string;
          reported_by?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_order_items: {
        Row: {
          id: string;
          tenant_id: string;
          service_order_id: string;
          description: string;
          quantity: number;
          unit_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_order_status_history: {
        Row: {
          id: string;
          tenant_id: string;
          service_order_id: string;
          status: string;
          changed_at: string;
          actor_person_id: string | null;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          status?: string;
          changed_at?: string;
          actor_person_id?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string;
          status?: string;
          changed_at?: string;
          actor_person_id?: string | null;
          metadata?: Record<string, unknown>;
        };
      };
      service_orders: {
        Row: {
          id: string;
          tenant_id: string;
          company_service_id: string;
          status: string;
          scheduled_at: string | null;
          completed_at: string | null;
          quantity: number | null;
          value: number | null;
          period_start: string | null;
          period_end: string | null;
          location: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_service_id?: string;
          status?: string;
          scheduled_at?: string | null;
          completed_at?: string | null;
          quantity?: number | null;
          value?: number | null;
          period_start?: string | null;
          period_end?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_service_id?: string;
          status?: string;
          scheduled_at?: string | null;
          completed_at?: string | null;
          quantity?: number | null;
          value?: number | null;
          period_start?: string | null;
          period_end?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_sla: {
        Row: {
          id: string;
          tenant_id: string;
          service_id: string | null;
          priority: string;
          response_due_hours: number;
          resolution_due_hours: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_id?: string | null;
          priority?: string;
          response_due_hours?: number;
          resolution_due_hours?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_id?: string | null;
          priority?: string;
          response_due_hours?: number;
          resolution_due_hours?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          category: 'rh' | 'facilities' | 'terceirizacao' | 'candidate' | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          category?: 'rh' | 'facilities' | 'terceirizacao' | 'candidate' | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          category?: 'rh' | 'facilities' | 'terceirizacao' | 'candidate' | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          category: string | null;
          description: string | null;
          is_global: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          name?: string;
          category?: string | null;
          description?: string | null;
          is_global?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          name?: string;
          category?: string | null;
          description?: string | null;
          is_global?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stage_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          order_index: number;
          is_mandatory: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          order_index?: number;
          is_mandatory?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          order_index?: number;
          is_mandatory?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_balances: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          quantity: number;
          reserved_quantity: number;
          available_quantity: number;
          last_movement_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          quantity?: number;
          reserved_quantity?: number;
          available_quantity?: number;
          last_movement_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          quantity?: number;
          reserved_quantity?: number;
          available_quantity?: number;
          last_movement_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_entries: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number | null;
          movement_type: string;
          reference_id: string | null;
          reference_type: string | null;
          notes: string | null;
          actor_person_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number | null;
          movement_type?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number | null;
          movement_type?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
        };
      };
      stock_inventory: {
        Row: {
          id: string;
          tenant_id: string;
          warehouse_id: string;
          status: string;
          started_at: string;
          finished_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          warehouse_id?: string;
          status?: string;
          started_at?: string;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          warehouse_id?: string;
          status?: string;
          started_at?: string;
          finished_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_inventory_items: {
        Row: {
          id: string;
          tenant_id: string;
          inventory_id: string;
          product_id: string;
          lot_id: string | null;
          warehouse_location_id: string | null;
          counted_quantity: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          inventory_id?: string;
          product_id?: string;
          lot_id?: string | null;
          warehouse_location_id?: string | null;
          counted_quantity?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          inventory_id?: string;
          product_id?: string;
          lot_id?: string | null;
          warehouse_location_id?: string | null;
          counted_quantity?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_lots: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          lot_code: string;
          expiry_date: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          lot_code?: string;
          expiry_date?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          lot_code?: string;
          expiry_date?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          movement_type: string;
          quantity: number;
          reference_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          movement_type?: string;
          quantity?: number;
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          movement_type?: string;
          quantity?: number;
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_ticket_assignments: {
        Row: {
          id: string;
          tenant_id: string;
          ticket_id: string;
          person_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          ticket_id?: string;
          person_id?: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          ticket_id?: string;
          person_id?: string;
          assigned_at?: string;
        };
      };
      support_ticket_categories: {
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
          tenant_id?: string;
          name?: string;
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
      support_ticket_messages: {
        Row: {
          id: string;
          tenant_id: string;
          ticket_id: string;
          person_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          ticket_id?: string;
          person_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          ticket_id?: string;
          person_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_ticket_status_history: {
        Row: {
          id: string;
          tenant_id: string;
          ticket_id: string;
          status: string;
          changed_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          ticket_id?: string;
          status?: string;
          changed_at?: string;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          ticket_id?: string;
          status?: string;
          changed_at?: string;
          metadata?: Record<string, unknown>;
        };
      };
      support_tickets: {
        Row: {
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
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          category_id?: string;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          assignee_person_id?: string | null;
          sla_due_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          assignee_person_id?: string | null;
          sla_due_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      talent_pool_memberships: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          source: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          source?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          source?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_attachments: {
        Row: {
          id: string;
          tenant_id: string;
          task_id: string;
          file_url: string;
          file_name: string;
          mime_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          file_url?: string;
          file_name?: string;
          mime_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          file_url?: string;
          file_name?: string;
          mime_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      task_comments: {
        Row: {
          id: string;
          tenant_id: string;
          task_id: string;
          person_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          person_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          person_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_status_history: {
        Row: {
          id: string;
          tenant_id: string;
          task_id: string;
          status: string;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          status?: string;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          task_id?: string;
          status?: string;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          status: string;
          related_entity_type: string | null;
          related_entity_id: string | null;
          assignee_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          assignee_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          assignee_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tax_calculations: {
        Row: {
          id: string;
          tenant_id: string;
          tax_rate_id: string;
          base_amount: number;
          tax_amount: number;
          calculation_type: string;
          reference_type: string | null;
          reference_id: string | null;
          actor_person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          tax_rate_id?: string;
          base_amount?: number;
          tax_amount?: number;
          calculation_type?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          tax_rate_id?: string;
          base_amount?: number;
          tax_amount?: number;
          calculation_type?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          actor_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tax_rates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: string;
          rate: number;
          effective_date: string;
          expiration_date: string | null;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          rate?: number;
          effective_date?: string;
          expiration_date?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          rate?: number;
          effective_date?: string;
          expiration_date?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_memberships: {
        Row: {
          id: string;
          person_id: string;
          tenant_id: string;
          status: string;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          status?: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          tenant_id?: string;
          status?: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_settings: {
        Row: {
          id: string;
          tenant_id: string;
          key: string;
          value: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          key?: string;
          value?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          key?: string;
          value?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      third_party_custody: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          status: string;
          expected_return_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          status?: string;
          expected_return_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          company_id?: string;
          status?: string;
          expected_return_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      third_party_custody_items: {
        Row: {
          id: string;
          tenant_id: string;
          custody_id: string;
          product_id: string;
          quantity: number;
          returned_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          custody_id?: string;
          product_id?: string;
          quantity?: number;
          returned_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          custody_id?: string;
          product_id?: string;
          quantity?: number;
          returned_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      validation_results: {
        Row: {
          id: string;
          tenant_id: string;
          gate: string;
          suite: string;
          test_name: string;
          status: string;
          message: string | null;
          details: Record<string, unknown> | null;
          executed_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          gate?: string;
          suite?: string;
          test_name?: string;
          status?: string;
          message?: string | null;
          details?: Record<string, unknown> | null;
          executed_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          gate?: string;
          suite?: string;
          test_name?: string;
          status?: string;
          message?: string | null;
          details?: Record<string, unknown> | null;
          executed_at?: string;
        };
      };
      warehouse_locations: {
        Row: {
          id: string;
          tenant_id: string;
          warehouse_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          warehouse_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          warehouse_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      warehouses: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          address: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name?: string;
          address?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          address?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      webhook_deliveries: {
        Row: {
          id: string;
          tenant_id: string;
          event_id: string;
          destination: string;
          status: string;
          attempts: number;
          last_error: string | null;
          sent_at: string | null;
          failed_at: string | null;
          response_status: number | null;
          response_body: Record<string, unknown> | null;
          actor_person_id: string | null;
          correlation_id: string | null;
          idempotency_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          event_id?: string;
          destination?: string;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          sent_at?: string | null;
          failed_at?: string | null;
          response_status?: number | null;
          response_body?: Record<string, unknown> | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          event_id?: string;
          destination?: string;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          sent_at?: string | null;
          failed_at?: string | null;
          response_status?: number | null;
          response_body?: Record<string, unknown> | null;
          actor_person_id?: string | null;
          correlation_id?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_order_acceptances: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string;
          customer_id: string | null;
          approved_by: string | null;
          status: string;
          approved_at: string | null;
          rejected_at: string | null;
          comments: string | null;
          signature_document_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          customer_id?: string | null;
          approved_by?: string | null;
          status?: string;
          approved_at?: string | null;
          rejected_at?: string | null;
          comments?: string | null;
          signature_document_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          customer_id?: string | null;
          approved_by?: string | null;
          status?: string;
          approved_at?: string | null;
          rejected_at?: string | null;
          comments?: string | null;
          signature_document_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_order_assignments: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string;
          employee_id: string;
          role: string | null;
          scheduled_start: string | null;
          scheduled_end: string | null;
          actual_start: string | null;
          actual_end: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          employee_id?: string;
          role?: string | null;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          actual_start?: string | null;
          actual_end?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          employee_id?: string;
          role?: string | null;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          actual_start?: string | null;
          actual_end?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_order_attachments: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string;
          file_url: string;
          file_name: string;
          mime_type: string | null;
          category: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          file_url?: string;
          file_name?: string;
          mime_type?: string | null;
          category?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          file_url?: string;
          file_name?: string;
          mime_type?: string | null;
          category?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      work_order_checklists: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string;
          item_text: string;
          is_checked: boolean;
          checked_by: string | null;
          checked_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          item_text?: string;
          is_checked?: boolean;
          checked_by?: string | null;
          checked_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          item_text?: string;
          is_checked?: boolean;
          checked_by?: string | null;
          checked_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_order_materials: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string;
          product_id: string;
          stock_lot_id: string | null;
          planned_quantity: number;
          used_quantity: number;
          returned_quantity: number;
          unit_cost: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          planned_quantity?: number;
          used_quantity?: number;
          returned_quantity?: number;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          product_id?: string;
          stock_lot_id?: string | null;
          planned_quantity?: number;
          used_quantity?: number;
          returned_quantity?: number;
          unit_cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_order_occurrences: {
        Row: {
          id: string;
          tenant_id: string;
          work_order_id: string;
          occurrence_type: string;
          description: string;
          severity: string;
          reported_by: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          occurrence_type?: string;
          description?: string;
          severity?: string;
          reported_by?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          work_order_id?: string;
          occurrence_type?: string;
          description?: string;
          severity?: string;
          reported_by?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_orders: {
        Row: {
          id: string;
          tenant_id: string;
          service_order_id: string | null;
          contract_id: string | null;
          customer_id: string | null;
          location_id: string | null;
          assigned_employee_id: string | null;
          title: string;
          description: string | null;
          priority: string;
          status: string;
          scheduled_start: string | null;
          scheduled_end: string | null;
          started_at: string | null;
          completed_at: string | null;
          completion_notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string | null;
          contract_id?: string | null;
          customer_id?: string | null;
          location_id?: string | null;
          assigned_employee_id?: string | null;
          title?: string;
          description?: string | null;
          priority?: string;
          status?: string;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          completion_notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_order_id?: string | null;
          contract_id?: string | null;
          customer_id?: string | null;
          location_id?: string | null;
          assigned_employee_id?: string | null;
          title?: string;
          description?: string | null;
          priority?: string;
          status?: string;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          completion_notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
