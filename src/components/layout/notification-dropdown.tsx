'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  limit,
} from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  MessageSquare,
  Package,
  AlertTriangle,
  Check,
  Trash2,
  Loader2,
  Inbox,
  Users,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { formatTimestamp } from '@/lib/utils';
import { Notification, NotificationType } from '@/types';

export default function NotificationDropdown() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const t = useTranslations('Notifications');
  const [isOpen, setIsOpen] = useState(false);

  // Real-time query to fetch user's notifications (limit to last 50 for performance)
  const notificationsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [firestore, user]);

  const { data: notifications, loading, error } = useCollection<Notification>(notificationsQuery);

  // Compute unread count
  const unreadCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Actions
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!firestore || !user) return;
    try {
      const docRef = doc(firestore, `users/${user.uid}/notifications`, id);
      await updateDoc(docRef, { read: true });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!firestore || !user) return;
    try {
      const docRef = doc(firestore, `users/${user.uid}/notifications`, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!firestore || !user || !notifications) return;
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length === 0) return;

      const batch = writeBatch(firestore);
      unreadNotifications.forEach((n) => {
        const docRef = doc(firestore, `users/${user.uid}/notifications`, n.id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClearAll = async () => {
    if (!firestore || !user || !notifications) return;
    try {
      const batch = writeBatch(firestore);
      notifications.forEach((n) => {
        const docRef = doc(firestore, `users/${user.uid}/notifications`, n.id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification & { id: string }) => {
    setIsOpen(false);
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Helper to render type-specific icons and styles
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return {
          icon: MessageSquare,
          colorClass: 'text-blue-600 dark:text-blue-400',
          bgClass: 'bg-blue-100 dark:bg-blue-950/40',
        };
      case 'order':
        return {
          icon: Package,
          colorClass: 'text-emerald-600 dark:text-emerald-400',
          bgClass: 'bg-emerald-100 dark:bg-emerald-950/40',
        };
      case 'alert':
        return {
          icon: AlertTriangle,
          colorClass: 'text-rose-600 dark:text-rose-400',
          bgClass: 'bg-rose-100 dark:bg-rose-950/40',
        };
      case 'community':
        return {
          icon: Users,
          colorClass: 'text-purple-600 dark:text-purple-400',
          bgClass: 'bg-purple-100 dark:bg-purple-950/40',
        };
      default:
        return {
          icon: Bell,
          colorClass: 'text-slate-600 dark:text-slate-400',
          bgClass: 'bg-slate-100 dark:bg-slate-950/40',
        };
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold ring-2 ring-background animate-in zoom-in"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t('title')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[360px] md:w-[420px] p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm font-headline">{t('title')}</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                {unreadCount} {t('unread')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 px-2 text-xs font-medium text-primary hover:text-primary/90"
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                {t('markAllAsRead')}
              </Button>
            )}
            {notifications && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 px-2 text-xs font-medium text-destructive hover:text-destructive/90"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                {t('clearAll')}
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="h-[360px] md:h-[400px]">
          {loading ? (
            <div className="flex h-full min-h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-destructive">
              Error loading notifications.
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{t('noNotifications')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                We will notify you when something important happens.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const { icon: TypeIcon, colorClass, bgClass } = getTypeStyles(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group relative flex items-start gap-3 border-b border-border/40 px-4 py-3.5 transition-colors cursor-pointer select-none
                      ${
                        notification.read
                          ? 'bg-background hover:bg-accent/40'
                          : 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15'
                      }`}
                  >
                    {/* Icon Column */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
                      <TypeIcon className={`h-5 w-5 ${colorClass}`} />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-medium leading-none truncate ${
                          notification.read ? 'text-foreground font-semibold' : 'text-foreground font-bold'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                          {formatTimestamp(notification.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-normal mt-1.5 line-clamp-2 ${
                        notification.read ? 'text-muted-foreground' : 'text-foreground/90 font-medium'
                      }`}>
                        {notification.body}
                      </p>
                    </div>

                    {/* Quick Action Overlay (shows on hover) */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-background pl-4">
                      {!notification.read && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-md bg-background shadow-sm hover:bg-accent"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title={t('markAsRead')}
                        >
                          <Check className="h-3.5 w-3.5 text-primary" />
                          <span className="sr-only">{t('markAsRead')}</span>
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 rounded-md bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => handleDelete(notification.id, e)}
                        title={t('delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">{t('delete')}</span>
                      </Button>
                    </div>

                    {/* Unread indicator dot */}
                    {!notification.read && (
                      <span className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-primary group-hover:opacity-0 transition-opacity" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
