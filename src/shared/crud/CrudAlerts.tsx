import { AlertTriangle, CheckCircle } from 'lucide-react';

export function FormSuccessAlert({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
      <CheckCircle className="h-4 w-4" />
      {message}
    </div>
  );
}

export function FormErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
      <AlertTriangle className="h-4 w-4" />
      {message}
    </div>
  );
}
