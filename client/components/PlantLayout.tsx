import { ReactNode } from 'react';
import PlantHeader from './PlantHeader';
import PlantNavigation from './PlantNavigation';

interface PlantLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
}

export default function PlantLayout({ 
  children, 
  title,
  showHeader = true,
  showNavigation = true 
}: PlantLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {showHeader && <PlantHeader title={title} />}
      {showNavigation && <PlantNavigation />}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
