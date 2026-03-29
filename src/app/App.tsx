import React from 'react';
import { AppRoutes } from './routes';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useGlobalDragScroll } from '@/hooks/useGlobalDragScroll';

const App: React.FC = () => {
  useGlobalDragScroll();

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;
