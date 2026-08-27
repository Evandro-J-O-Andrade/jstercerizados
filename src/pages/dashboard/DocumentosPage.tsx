import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Folder, FileText, Upload } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface File {
  id: string;
  name: string;
  bucket_id: string;
  created_at: string;
}

export default function DocumentosPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchFiles = async () => {
      try {
        let query = supabase
          .from('files')
          .select('id, name, bucket_id, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!isAdminMaster) {
          const activeTenantId =
            currentTenantId || tenantMemberships[0]?.tenant_id;
          if (activeTenantId) {
            query = query.eq('tenant_id', activeTenantId);
          }
        }

        const { data } = await query;
        setFiles(data || []);
      } catch (error) {
        console.error('[DOCUMENTOS] Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Documentos"
      description="Documentos e arquivos da plataforma."
      icon={Folder}
      breadcrumbItems={[{ label: 'Documentos', href: '/dashboard/documentos' }]}
      actions={
        <button className="flex items-center gap-1 text-sm">
          <Upload className="h-4 w-4" />
          Novo documento
        </button>
      }
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando documentos...
        </div>
      ) : files.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">
            Nenhum documento encontrado.
          </p>
        </Card>
      ) : (
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Nome
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Bucket
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="text-foreground flex items-center gap-2 px-4 py-3 text-sm font-medium">
                    <FileText className="text-muted-foreground h-4 w-4" />
                    {file.name}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {file.bucket_id}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {new Date(file.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModuleWorkspace>
  );
}

