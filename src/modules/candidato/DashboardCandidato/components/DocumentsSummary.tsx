import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { formatDate } from '@/utils';

export function DocumentsSummary() {
  const { candidate } = useCandidato();
  const documents = (candidate?.documents || []).slice(0, 3);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Documentos
            </h3>
            <p className="text-sm text-slate-500">Currículo e anexos</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="/candidato/documentos">
            Gerenciar
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="p-6">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Nenhum documento enviado
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Envie seu currículo em PDF para agilizar suas candidaturas
            </p>
            <Button className="mt-4" size="sm" asChild>
              <a href="/candidato/documentos">Enviar currículo</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {doc.name || 'Currículo.pdf'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doc.created_at ? formatDate(doc.created_at) : 'Atualizado recentemente'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Privado
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
