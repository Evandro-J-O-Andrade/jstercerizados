import { describe, it, expect } from 'vitest';
import { DataState } from '@/components/feedback/DataState';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

describe('DataState', () => {
  const testData = { id: 1, name: 'Test' };

  it('renders loader for loading status', () => {
    const { getByText } = render(
      <DataState
        status="loading"
        data={null}
        error={null}
        children={() => <div>Content</div>}
      />,
    );
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('renders inline loader when loader="inline"', () => {
    const { getByText } = render(
      <DataState
        status="loading"
        data={null}
        error={null}
        loader="inline"
        children={() => <div>Content</div>}
      />,
    );
    expect(getByText('Carregando')).toBeTruthy();
  });

  it('renders nothing when loader={false}', () => {
    const { container } = render(
      <DataState
        status="loading"
        data={null}
        error={null}
        loader={false}
        children={() => <div>Content</div>}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders success content with data', () => {
    const { getByText } = render(
      <DataState
        status="success"
        data={testData}
        error={null}
        children={(data) => <div>Data: {data.name}</div>}
      />,
    );
    expect(getByText('Data: Test')).toBeTruthy();
  });

  it('renders empty state when status is empty', () => {
    const { getByText } = render(
      <DataState
        status="empty"
        data={null}
        error={null}
        emptyTitle="No items"
        children={() => <div>Content</div>}
      />,
    );
    expect(getByText('No items')).toBeTruthy();
  });

  it('renders error state for error status', () => {
    const onRetry = vi.fn();
    const { getByText } = render(
      <DataState
        status="error"
        data={null}
        error={new Error('Failed')}
        onRetry={onRetry}
        children={() => <div>Content</div>}
      />,
    );
    expect(getByText('Não foi possível carregar os dados')).toBeTruthy();
  });

  it('renders timeout state for timed_out', () => {
    const onRetry = vi.fn();
    const { getByText } = render(
      <DataState
        status="timed_out"
        data={null}
        error={null}
        onRetry={onRetry}
        children={() => <div>Content</div>}
      />,
    );
    expect(
      getByText('A operação está demorando mais que o esperado.'),
    ).toBeTruthy();
  });

  it('renders not_found state', () => {
    const { getByText } = render(
      <DataState
        status="not_found"
        data={null}
        error={null}
        children={() => <div>Content</div>}
      />,
    );
    expect(getByText('Registro não encontrado')).toBeTruthy();
  });

  it('renders unauthorized state', () => {
    const { getByText } = render(
      <DataState
        status="unauthorized"
        data={null}
        error={null}
        children={() => <div>Content</div>}
      />,
    );
    expect(getByText('Acesso não autorizado')).toBeTruthy();
  });

  it('renders empty state for success with null data', () => {
    const { getByText } = render(
      <DataState
        status="success"
        data={null}
        error={null}
        children={() => <div>Content</div>}
      />,
    );
    expect(getByText('Nenhum registro encontrado')).toBeTruthy();
  });

  it('applies content className when provided', () => {
    const { container } = render(
      <DataState
        status="success"
        data={testData}
        error={null}
        contentClassName="custom-content"
        children={(data) => <span>{data.name}</span>}
      />,
    );
    const span = container.querySelector('span');
    const wrapper = span?.parentElement;
    expect(wrapper?.className).toContain('custom-content');
  });
});
