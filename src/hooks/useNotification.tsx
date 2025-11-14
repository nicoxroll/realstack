import { useState, useCallback } from 'react';
import Notification, { NotificationType } from '../components/Notification';

interface NotificationState {
  message: string;
  type: NotificationType;
  id: number;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({
      message,
      type,
      id: Date.now(),
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const NotificationComponent = notification ? (
    <Notification
      key={notification.id}
      message={notification.message}
      type={notification.type}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
}
