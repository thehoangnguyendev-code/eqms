import React from 'react';
import { AppRoutes } from './routes';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const App: React.FC = () => {

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
