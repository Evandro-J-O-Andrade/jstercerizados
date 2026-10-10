'use client';

import { type ReactNode } from 'react';
import { AvaLauncher } from '../components';
import { useAva } from '../context/AvaContext';

interface AvaContainerProps {
  children?: ReactNode;
  showLauncher?: boolean;
}

export function AvaContainer({
  children,
  showLauncher = true,
}: AvaContainerProps) {
  const { tutorialsByModule } = useAva();

  const allTutorials = Object.values(tutorialsByModule).flat();

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">{children}</div>
      {showLauncher && (
        <AvaLauncher tutorials={allTutorials} onTutorialClick={() => {}} />
      )}
    </div>
  );
}
