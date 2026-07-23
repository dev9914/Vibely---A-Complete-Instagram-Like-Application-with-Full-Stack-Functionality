import React, { useMemo } from 'react';
import { X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetNotificationsQuery, useMarkAllNotificationsAsReadMutation, useMarkNotificationAsReadMutation } from '../../services/notificationApi';
import { formatDistanceToNow, isThisMonth, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import type { Notification } from '../../services/notificationApi';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * NotificationPanel Component
 * 
 * Full-width notification panel that slides out from left sidebar
 * Similar to Instagram's notification panel design
 */
const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

const handleMarkAllRead = async () => {
    try {
        await markAllAsRead().unwrap();
    } catch (err) {
        console.error(err);
    }
};
  
  const { data, isLoading, error } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const notifications = data?.notifications || [];

  // Group notifications by time period
  const groupedNotifications = useMemo(() => {
    const thisMonth: Notification[] = [];
    const earlier: Notification[] = [];

    notifications.forEach((notification) => {
      const date = parseISO(notification.createdAt);
      if (isThisMonth(date)) {
        thisMonth.push(notification);
      } else {
        earlier.push(notification);
      }
    });

    return { thisMonth, earlier };
  }, [notifications]);

const [markAsRead] = useMarkNotificationAsReadMutation();

const handleNotificationClick = async (notification: Notification) => {
  try {

    if (!notification.isRead) {
      await markAsRead(notification._id).unwrap();
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  
    

    onClose();
  } catch (err) {
    console.error(err);
  }
};

  // Get notification message based on type
  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return 'started following you.';
      case 'like':
        return 'liked your post.';
      case 'comment':
        return 'commented on your post.';
      case 'mention':
        return 'mentioned you in a comment.';
      case 'story':
        return 'liked your story.';
      case 'reply':
        return 'replied to your comment.';
      default:
        return notification.message;
    }
  };

  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: false })
      .replace('about ', '')
      .replace('less than a minute', 'now')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' weeks', 'w')
      .replace(' week', 'w')
      .replace(' months', 'mo')
      .replace(' month', 'mo');
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const isFollow = notification.type === 'follow';
    const hasMedia = notification.relatedResource?.resourceType === 'post';


    return (
      <div
        onClick={() => handleNotificationClick(notification)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
          "hover:bg-zinc-900/60",
          !notification.isRead && "bg-zinc-900/30"
        )}
      >
        {/* Avatar */}
        <Avatar
    onClick={(e)=>{
        e.stopPropagation();
        navigate(`/user/${notification.sender._id}`);
        onClose();
    }}
    className="cursor-pointer h-11 w-11"
>
          <AvatarImage
            src={notification.sender.avatar || '/default-avatar.png'}
            alt={notification.sender.username}
          />
          <AvatarFallback className="bg-zinc-800 text-white">
            {notification.sender.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white leading-snug">
            <span
    onClick={(e)=>{
        e.stopPropagation();
        navigate(`/user/${notification.sender._id}`);
        onClose();
    }}
    className="font-semibold hover:underline cursor-pointer"
>
    {notification.sender.username}
</span>
            {' '}
            <span className="text-zinc-400">
              {getNotificationMessage(notification)}
            </span>
            {' '}
            <span className="text-zinc-500">{formatTime(notification.createdAt)}</span>
          </p>
        </div>

        {/* Right side - Follow button or Post thumbnail */}
        {isFollow ? (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              // Handle follow back action
            }}
          >
            Following
          </Button>
        ) : hasMedia ? (
          <div className="w-11 h-11 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
  {notification.postPreview ? (
    <img
      src={notification.postPreview}
      alt="Post"
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="h-full w-full bg-zinc-700" />
  )}
</div>
        ) : null}
      </div>
    );
  };

  const NotificationSection = ({ title, items }: { title: string; items: Notification[] }) => {
    if (items.length === 0) return null;

    return (
      <div>
        <h3 className="px-4 py-2 text-sm font-semibold text-white">{title}</h3>
        <div>
          {items.map((notification) => (
            <NotificationItem key={notification._id} notification={notification} />
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - covers everything except the collapsed sidebar */}
      <div 
        className="fixed inset-0 left-[72px] z-40 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 left-[72px] z-50 h-screen w-[400px] bg-zinc-950",
          "border-r border-zinc-800 rounded-r-3xl shadow-2xl overflow-hidden",
          "animate-in slide-in-from-left duration-300"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6">
    <h2 className="text-2xl font-bold text-white">
        Notifications
    </h2>

    <div className="flex items-center gap-2">
        <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-400 hover:text-white"
            onClick={handleMarkAllRead}
        >
            Mark all as read
        </Button>

        <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
            <X className="h-5 w-5" />
        </Button>
    </div>
</div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-80px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-white mb-4"></div>
              <p className="text-sm text-zinc-500">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-sm text-white font-medium mb-1">Unable to load notifications</p>
              <p className="text-xs text-zinc-500 text-center">
                Please try again later.
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-lg text-white font-medium mb-1">
                No notifications yet
              </p>
              <p className="text-sm text-zinc-500 text-center">
                When someone likes, comments, or follows you,<br />you'll see it here.
              </p>
            </div>
          ) : (
            <div className="pb-4">
              <NotificationSection title="This month" items={groupedNotifications.thisMonth} />
              {groupedNotifications.thisMonth.length > 0 && groupedNotifications.earlier.length > 0 && (
                <Separator className="my-2 bg-zinc-800" />
              )}
              <NotificationSection title="Earlier" items={groupedNotifications.earlier} />
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
};

export default NotificationPanel;
