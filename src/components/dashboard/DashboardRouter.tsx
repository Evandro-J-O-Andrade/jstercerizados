import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardRouteNotFound() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <h1 className="text-foreground text-8xl font-extrabold sm:text-9xl">
          404
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-lg text-xl">
          A página que você procura não foi encontrada no painel.
        </p>
        <div className="mt-10">
          <Link to="/dashboard">
            <Button variant="primary" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Voltar para o painel
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
