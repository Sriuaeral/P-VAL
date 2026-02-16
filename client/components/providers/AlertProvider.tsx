import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { EnhancedAlertDialog } from '@/components/ui/alert-dialog';

interface Alert {
  id: string;
  type: 'dialog' | 'toast';
  component: React.ReactElement;
}

interface AlertContextType {
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  clearAll: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts(prev => [...prev, alert]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  const value: AlertContextType = {
    addAlert,
    removeAlert,
    clearAll,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {/* Render alerts in a portal */}
      {typeof window !== 'undefined' && createPortal(
        <div className="alert-portal">
          {alerts.map(alert => (
            <div key={alert.id}>
              {alert.component}
            </div>
          ))}
        </div>,
        document.body
      )}
    </AlertContext.Provider>
  );
};
