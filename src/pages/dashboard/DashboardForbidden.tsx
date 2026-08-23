import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardForbidden() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <div className="bg-destructive/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <Shield className="text-destructive h-10 w-10" />
        </div>
        <h1 className="text-foreground mb-4 text-4xl font-bold">403</h1>
        <h2 className="text-foreground mb-4 text-2xl font-bold">
          Acesso negado
        </h2>
        <p className="text-muted-foreground mb-8">
          Você não possui permissão para acessar esta área. Entre em contato com
          o administrador se acredita que isso é um erro.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/dashboard">
            <Button variant="primary" size="lg">
              Voltar para o painel
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
