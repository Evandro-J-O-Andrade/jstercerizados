'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServiceForm } from '@/modules/servicos/components/ServiceForm';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Service, ServiceStatus } from '@/types/domain/service';
import { SERVICOS_PERMISSIONS } from '@/modules/servicos/permissions';
import { PageLoader } from '@/components/ui/PageLoader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Edit, X } from 'lucide-react';
import { cn } from '@/utils';

const STATUS_LABELS: Record<ServiceStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

const STATUS_COLORS: Record<ServiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800',
};

export default function ServicoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canUpdate = hasAnyPermission([SERVICOS_PERMISSIONS.servicesUpdate]);
  const canDelete = hasAnyPermission([SERVICOS_PERMISSIONS.servicesDelete]);

  useEffect(() => {
    const loadService = async () => {
      try {
        setIsLoading(true);
        const services = await servicesRepository.findServices(
          currentTenantId || '',
        );
        const found = services.find((s) => s.id === id);
        if (found) {
          setService(found);
        } else {
          setError('Serviço não encontrado');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar serviço',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadService();
  }, [id, currentTenantId]);

  const handleDelete = async () => {
    if (!service) return;
    setDeleting(true);
    try {
      await servicesRepository.deleteService(service.tenant_id, service.id);
      navigate('/dashboard/servicos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir serviço');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (!service) return;
    await servicesRepository.updateService(service.tenant_id, service.id, data);
    setModalOpen(false);
    const updated = await servicesRepository.findServices(service.tenant_id);
    const found = updated.find((s) => s.id === service.id);
    if (found) setService(found);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !service) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">
            {error || 'Serviço não encontrado'}
          </p>
          <button
            onClick={() => navigate('/dashboard/servicos')}
            className="text-primary mt-4 hover:underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/servicos')}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-foreground text-xl font-semibold">
              {service.name}
            </h1>
            <p className="text-muted-foreground text-sm">{service.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(STATUS_COLORS[service.status])}>
            {STATUS_LABELS[service.status]}
          </Badge>
          {canUpdate && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          )}
        </div>
      </div>

      <Card className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-muted-foreground text-sm">ID</label>
            <p className="text-foreground font-mono text-sm">{service.id}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Tenant</label>
            <p className="text-foreground font-mono text-sm">
              {service.tenant_id}
            </p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Slug</label>
            <p className="text-foreground">{service.slug}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Categoria</label>
            <p className="text-foreground">{service.category}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-muted-foreground text-sm">
              Descrição curta
            </label>
            <p className="text-foreground">
              {service.short_description || '-'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-muted-foreground text-sm">Descrição</label>
            <p className="text-foreground">{service.description || '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Ícone</label>
            <p className="text-foreground">{service.icon || '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">
              Imagem do card
            </label>
            <p className="text-foreground">{service.card_image_url || '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Imagem hero</label>
            <p className="text-foreground">{service.hero_image_url || '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Título hero</label>
            <p className="text-foreground">{service.hero_title || '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">
              Subtítulo hero
            </label>
            <p className="text-foreground">{service.hero_subtitle || '-'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Benefícios</label>
            <div className="flex flex-wrap gap-2">
              {service.benefits?.length ? (
                service.benefits.map((b, i) => (
                  <Badge key={i} variant="secondary">
                    {b}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">
              Ordem de exibição
            </label>
            <p className="text-foreground">{service.display_order ?? 0}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">
              Publicado em
            </label>
            <p className="text-foreground">
              {service.published_at
                ? new Date(service.published_at).toLocaleString('pt-BR')
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">Criado em</label>
            <p className="text-foreground">
              {new Date(service.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm">
              Atualizado em
            </label>
            <p className="text-foreground">
              {new Date(service.updated_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </Card>

      {modalOpen && (
        <ServiceForm
          open={true}
          tenantId={currentTenantId || ''}
          editingService={service}
          serviceId={service.id}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
