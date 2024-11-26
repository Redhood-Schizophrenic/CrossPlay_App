import React, { createContext, useContext, useState, useCallback } from 'react';
import { CustomNotification } from './CustomNotification';

interface NotificationContextType {
  showNotification: (params: ShowNotificationParams) => void;
}

interface ShowNotificationParams {
  title: string;
  message: string;
  type?: 'warning' | 'success' | 'error';
  duration?: number;
  onPress?: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<ShowNotificationParams | null>(null);

  const showNotification = useCallback((params: ShowNotificationParams) => {
    setNotification(params);
  }, []);

  const handleClose = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <CustomNotification
          {...notification}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
};
