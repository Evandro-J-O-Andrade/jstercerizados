import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Wrench, Plus } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

interface Skill {
  id: string;
  code: string;
  name: string;
  category: string | null;
  created_at: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, code, name, category, created_at')
          .order('name', { ascending: true });

        if (error) throw error;
        setSkills(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar habilidades',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return (
    <ModuleWorkspace
      title="Habilidades"
      description="Catálogo de skills usado em vagas e candidatos."
      icon={Wrench}
      breadcrumbItems={[{ label: 'Habilidades' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Nova habilidade
        </Button>
      }
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando habilidades...
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">{error}</div>
      ) : skills.length === 0 ? (
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm">
            Nenhuma habilidade cadastrada no momento.
          </p>
        </div>
      ) : (
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Nome
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Código
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Categoria
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {skills.map((skill) => (
                <tr key={skill.id} className="hover:bg-muted/30">
                  <td className="text-foreground px-4 py-3 text-sm font-medium">
                    {skill.name}
                  </td>
                  <td className="text-foreground px-4 py-3 text-sm">
                    {skill.code}
                  </td>
                  <td className="text-foreground px-4 py-3 text-sm">
                    {skill.category || '-'}
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

