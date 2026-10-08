'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServiceForm } from '@/modules/servicos/components/ServiceForm';
import { servicesRepository } from '@/repositories/services.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Service } from '@/types/domain/service';
import { PageLoader } from '@/components/ui/PageLoader';

export default function ServicoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!id;

  useEffect(() => {
    if (!isEditing) {
      setIsLoading(false);
      return;
    }

    const loadService = async () => {
      try {
        setIsLoading(true);
        const service = await servicesRepository.findServices(
          currentTenantId || '',
        );
        const found = service.find((s) => s.id === id);
        if (found) {
          setEditingService(found);
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

  const handleSubmit = async (data: any) => {
    if (isEditing && editingService) {
      await servicesRepository.updateService(
        editingService.tenant_id,
        editingService.id,
        data,
      );
    } else {
      await servicesRepository.createService({
        ...data,
        tenant_id: currentTenantId || '',
      });
    }
    navigate('/dashboard/servicos');
  };

  const handleCancel = () => {
    navigate('/dashboard/servicos');
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
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
    <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <ServiceForm
        open={true}
        tenantId={currentTenantId || ''}
        editingService={editingService}
        serviceId={editingService?.id ?? null}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
