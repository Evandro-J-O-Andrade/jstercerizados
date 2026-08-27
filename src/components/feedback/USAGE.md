# Padrão de Feedback do Sistema

Componentes reutilizáveis para estados de interface do usuário.

## Componentes Disponíveis

### EmptyState

Usado quando não há registros para exibir.

```tsx
import { EmptyState } from '@/components/fallback';

<EmptyState
  title="Nenhum documento cadastrado"
  description="Ainda não há documentos vinculados a este funcionário."
  actionLabel="Adicionar documento"
  onAction={handleCreate}
/>;
```

### ErrorState

Usado quando ocorre um erro técnico na consulta.

```tsx
import { ErrorState } from '@/components/fallback';

<ErrorState
  title="Não foi possível carregar os dados"
  message="Ocorreu um problema ao consultar as informações. Tente novamente em alguns instantes."
  supportText="Se o problema persistir, entre em contato com o suporte."
  onRetry={handleRetry}
/>;
```

### NotFoundState

Usado quando um registro específico não existe.

```tsx
import { NotFoundState } from '@/components/fallback';

<NotFoundState
  title="Funcionário não encontrado"
  message="O funcionário solicitado não existe ou não está disponível para este ambiente."
  backLabel="Voltar para funcionários"
  onBack={handleBack}
/>;
```

### UnauthorizedState

Usado quando o usuário não tem permissão para acessar o recurso.

```tsx
import { UnauthorizedState } from '@/components/fallback';

<UnauthorizedState
  title="Acesso não autorizado"
  message="Você não possui permissão para acessar este recurso."
  backLabel="Voltar"
  onBack={handleBack}
/>;
```

### TimeoutState

Usado quando a operação demora mais que o esperado.

```tsx
import { TimeoutState } from '@/components/fallback';

<TimeoutState onRetry={handleRetry} />;
```

### ConfirmDialog

Usado para confirmações de ações destrutivas (excluir, desativar).

```tsx
import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback';

function MyComponent() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsDeleteOpen(true)}>Excluir</Button>

      <ConfirmDialog
        open={isDeleteOpen}
        title="Excluir este registro?"
        message="Essa ação removerá o registro e poderá afetar informações relacionadas."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </>
  );
}
```

### Alert

Usado para mensagens inline de feedback.

```tsx
import { Alert } from '@/components/feedback';

<Alert type="success" message="Cadastro realizado com sucesso!" />
<Alert type="error" message="Não foi possível salvar as alterações." />
<Alert type="warning" message="Atenção: esta ação não pode ser desfeita." />
<Alert type="info" message="Processamento em andamento..." />
```

### Toast

Usado para notificações temporárias.

```tsx
import { useToast } from '@/components/feedback';

function MyComponent() {
  const { addToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      addToast('Cadastro realizado com sucesso!', 'success');
    } catch {
      addToast('Não foi possível salvar as alterações.', 'error');
    }
  };

  return <Button onClick={handleSave}>Salvar</Button>;
}
```

## Regras

1. **Nunca mostrar detalhes técnicos** (erros de banco, RLS, chaves estrangeiras) para o usuário final.
2. **EmptyState** ≠ erro. Lista vazia é um estado válido.
3. **Sempre oferecer uma ação** quando possível (criar, tentar novamente, voltar).
4. **Mensagens curtas e diretas**. Evitar jargões técnicos.
5. **Usar os mesmos componentes em todos os módulos** para manter consistência.
