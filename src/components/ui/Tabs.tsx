'use client';

import * as React from 'react';

type TabsProps = {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

type TabsListProps = {
  children: React.ReactNode;
  className?: string;
};

type TabsTriggerProps = {
  children: React.ReactNode;
  value: string;
  className?: string;
};

type TabsContentProps = {
  children: React.ReactNode;
  value: string;
  className?: string;
};

const TabsContext = React.createContext<{ currentValue: string; onValueChange: (v: string) => void }>({ currentValue: '', onValueChange: () => {} });

function Tabs({ children, defaultValue, value, onValueChange }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const currentValue = value ?? internalValue;

  return (
    <TabsContext.Provider value={{ currentValue, onValueChange: onValueChange || ((v: string) => setInternalValue(v)) }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }: TabsListProps) {
  return <div className={className}>{children}</div>;
}

function TabsTrigger({ children, value, className }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  const active = ctx.currentValue === value;
  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

function TabsContent({ children, value, className }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (ctx.currentValue !== value) return null;
  return <div className={className}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
