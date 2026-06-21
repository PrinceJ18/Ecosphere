import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification } from '../types';
import { getStorageItem, setStorageItem, generateId } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { ToastContainer, ToastType } from '../components/Toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    title: string,
    message: string,
    type: Notification['type'],
    icon: string,
    actionUrl?: string
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  showToast: (message: string, type?: ToastType['type'], duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    const all = getStorageItem<Notification[]>('notifications', []);
    if (user) {
      // Filter notifications for current user (or keep all if not segmented)
      const userNotifications = all.filter(n => n.userId === user.id || !n.userId);
      setNotifications(userNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Load initially and when user changes
  useEffect(() => {
    loadNotifications();
  }, [user, loadNotifications]);

  // Save to localStorage when notifications state changes
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    
    // Merge back into total notifications in localStorage
    const all = getStorageItem<Notification[]>('notifications', []);
    const otherUsersNotifications = user
      ? all.filter(n => n.userId !== user.id && n.userId)
      : all;
    
    setStorageItem('notifications', [...otherUsersNotifications, ...newNotifications]);
  }, [user]);

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: Notification['type'],
      icon: string,
      actionUrl?: string
    ) => {
      if (!user) return;

      const newNotif: Notification = {
        id: generateId(),
        userId: user.id,
        title,
        message,
        type,
        read: false,
        icon,
        actionUrl,
        createdAt: new Date().toISOString(),
      };

      saveNotifications([newNotif, ...notifications]);

      // Map notification types to toast types
      let toastType: ToastType['type'] = 'info';
      if (type === 'achievement') toastType = 'success';
      if (type === 'challenge') toastType = 'success';
      if (type === 'system') toastType = 'warning';

      showToast(`${title}: ${message}`, toastType);
    },
    [user, notifications, saveNotifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback(
    (id: string) => {
      const updated = notifications.filter(n => n.id !== id);
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const showToast = useCallback((message: string, type: ToastType['type'] = 'info', duration = 4000) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        showToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
