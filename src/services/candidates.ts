import { getSupabaseClient } from '@/lib/supabase';
import type { CandidateFormData } from '@/pages/TrabalheConosco';

export interface CandidateSubmission {
  id?: string;
  status?: string;
  documentId?: string;
}

const SUPABASE_ERROR_MAP: Record<string, string> = {
  '23505': 'Você já enviou um currículo recentemente. Aguarde alguns minutos.',
  '23503': 'Dados incompletos. Verifique o formulário e tente novamente.',
  '42501': 'Permissão insuficiente para enviar currículo.',
};

function normalizeSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as Error & { code?: string }).code;
    if (code && SUPABASE_ERROR_MAP[code]) {
      return SUPABASE_ERROR_MAP[code];
    }
    return error.message;
  }
  return 'Erro inesperado ao enviar currículo. Tente novamente.';
}

export async function submitCandidateApplication(
  data: CandidateFormData,
  file: File | null,
  consentVersion: string,
): Promise<CandidateSubmission> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      'Serviço indisponível no momento. Tente novamente mais tarde.',
    );
  }

  const resumeFile = data.resumeFile?.[0] ?? null;
  const selectedFile = file ?? resumeFile;

  let documentId: string | undefined;

  if (selectedFile && selectedFile.size > 0) {
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() ?? 'pdf';
    const safeName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `curriculos/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('curriculos')
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: selectedFile.type,
      });

    if (uploadError) {
      throw new Error(`Erro ao enviar currículo: ${uploadError.message}`);
    }

    documentId = filePath;
  }

  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .insert({
      name: data.name.trim(),
      cpf: data.cpf?.trim() || null,
      rg: data.rg?.trim() || null,
      phone: data.phone.trim(),
      email: data.email.trim(),
      city: data.city.trim(),
      target_area: data.positions.join(', '),
      target_role: data.positions[0] || null,
      experience_summary: data.experience.trim(),
      status: 'new',
    })
    .select('id')
    .single();

  if (candidateError || !candidate) {
    if (documentId) {
      await supabase.storage.from('curriculos').remove([documentId]);
    }
    throw new Error(normalizeSupabaseError(candidateError));
  }

  const { error: curriculumError } = await supabase.from('curricula').insert({
    candidate_id: candidate.id,
    objective: data.resume.trim(),
    availability: data.availability?.trim() || null,
    cv_storage_path: documentId || null,
    status: 'active',
  });

  if (curriculumError) {
    await supabase.from('candidates').delete().eq('id', candidate.id);
    if (documentId) {
      await supabase.storage.from('curriculos').remove([documentId]);
    }
    throw new Error(`Erro ao salvar currículo: ${curriculumError.message}`);
  }

  if (documentId) {
    const { error: documentError } = await supabase
      .from('candidate_documents')
      .insert({
        candidate_id: candidate.id,
        tenant_id: (await getTenantId()) ?? null,
        storage_path: documentId,
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        size_bytes: selectedFile.size,
        category: 'cv',
      });

    if (documentError) {
      console.error('Erro ao registrar documento:', documentError);
    }
  }

  const { error: consentError } = await supabase.from('consents').insert({
    candidate_id: candidate.id,
    tenant_id: (await getTenantId()) ?? null,
    purpose: 'banco_de_talentos',
    status: 'granted',
    version: consentVersion,
    granted_at: new Date().toISOString(),
    metadata: {
      ip_address: null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    },
  });

  if (consentError) {
    console.error('Erro ao registrar consentimento:', consentError);
  }

  return {
    id: candidate.id,
    status: 'received',
    documentId,
  };
}

async function getTenantId(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'js-empregos')
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}
