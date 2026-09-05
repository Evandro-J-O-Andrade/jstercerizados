import Login from '@/pages/Login';
import type { AccessFlow } from '@/pages/Login';

type Props = {
  context: AccessFlow;
};

export function EntrarContexto({ context }: Props) {
  return <Login requestedContext={context} />;
}

export function EntrarAdmin() {
  return <EntrarContexto context="admin" />;
}

export function EntrarCandidato() {
  return <EntrarContexto context="candidato" />;
}

export function EntrarEmpresa() {
  return <EntrarContexto context="empresa" />;
}
