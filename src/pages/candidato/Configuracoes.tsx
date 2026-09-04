import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Lock, FileText, LogOut } from 'lucide-react';

export default function CandidateConfiguracoes() {
  const { person } = useAuth();
  return (
    <>
      <SEO
        title={`Configurações — ${COMPANY.name}`}
        description="Configurações da conta do candidato"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">Conta: {person?.email}</p>
        </header>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="text-muted-foreground h-5 w-5" />
            <h2 className="text-foreground text-base font-semibold">Conta</h2>
          </div>
          <div className="space-y-3">
            <Link to="/alterar-senha">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Alterar senha
                </span>
                <span>›</span>
              </Button>
            </Link>
            <Link to="/privacidade">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Política de privacidade
                </span>
                <span>›</span>
              </Button>
            </Link>
            <Link to="/termos">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Termos de uso
                </span>
                <span>›</span>
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <LogOut className="text-muted-foreground h-5 w-5" />
            <h2 className="text-foreground text-base font-semibold">Sessão</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Use o botão "Sair" no menu lateral para encerrar sua sessão.
          </p>
        </Card>
      </div>
    </>
  );
}
