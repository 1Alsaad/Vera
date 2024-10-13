import { useEffect, useState } from 'react';
import { Bell, X, AtSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tables, Database } from '@/types/supabase';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

type Notification = Tables<'notifications'>;
type Mention = Tables<'mentions'>;

interface CombinedNotification {
  id: string;
  type: 'notification' | 'mention';
  message: string;
  created_at: string;
  read: boolean;
  details?: {
    mentioned_by?: string;
    task_id?: number;
    task_title?: string;
  };
}

export function NotificationSection() {
  const [notifications, setNotifications] = useState<CombinedNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotificationsAndMentions();
    const channel = setupRealtimeSubscription();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchNotificationsAndMentions = async () => {
    const [notificationsResponse, mentionsResponse] = await Promise.all([
      supabase
        .from('notifications')
        .select('*, tasks(id, title)')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('mentions')
        .select(`
          *,
          messages(message),
          mentioned_by_profile:profiles!mentioned_by(firstname, lastname),
          mentioned_user:profiles!mentioned_user_id(firstname, lastname)
        `)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    const combinedNotifications: CombinedNotification[] = [
      ...(notificationsResponse.data || []).map((notif: any): CombinedNotification => ({
        id: notif.id.toString(),
        type: 'notification',
        message: notif.message,
        created_at: notif.created_at || '',
        read: notif.read || false,
        details: notif.tasks ? {
          task_id: notif.tasks.id,
          task_title: notif.tasks.title
        } : undefined
      })),
      ...(mentionsResponse.data || []).map((mention: any): CombinedNotification => ({
        id: mention.id,
        type: 'mention',
        message: mention.messages?.message || '',
        created_at: mention.created_at || '',
        read: mention.read || false,
        details: {
          mentioned_by: mention.mentioned_by_profile 
            ? `${mention.mentioned_by_profile.firstname || ''} ${mention.mentioned_by_profile.lastname || ''}`.trim() || 'Someone'
            : 'Someone',
        }
      }))
    ];

    combinedNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setNotifications(combinedNotifications);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase.channel('custom-notifications-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        async (payload) => {
          if (payload.new) {
            const { data: taskData, error } = await supabase
              .from('tasks')
              .select('id, title')
              .eq('id', payload.new.id)
              .single();

            const newNotification: CombinedNotification = {
              id: payload.new.id.toString(),
              type: 'notification',
              message: payload.new.message,
              created_at: payload.new.created_at || '',
              read: payload.new.read || false,
              details: taskData && !error ? {
                task_id: taskData.id,
                task_title: taskData.title
              } : undefined
            };
            setNotifications((prev) => [newNotification, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mentions' },
        async (payload: { new: Mention }) => {
          const { data } = await supabase
            .from('mentions')
            .select(`
              *,
              messages(message),
              mentioned_by_profile:profiles!mentioned_by(firstname, lastname),
              mentioned_user:profiles!mentioned_user_id(firstname, lastname)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const newMention: CombinedNotification = {
              id: data.id,
              type: 'mention',
              message: data.messages?.message || '',
              created_at: data.created_at || '',
              read: false,
              details: {
                mentioned_by: data.mentioned_by_profile 
                  ? `${data.mentioned_by_profile.firstname || ''} ${data.mentioned_by_profile.lastname || ''}`.trim() || 'Someone'
                  : 'Someone',
              }
            };
            setNotifications((prev) => [newMention, ...prev]);
          }
        }
      )
      .subscribe();

    return channel;
  };

  const markAsRead = async (id: string, type: 'notification' | 'mention') => {
    if (type === 'notification') {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    else {
      const { error } = await supabase
        .from('mentions')
        .update({ read: true } as any) // Type assertion to bypass type check
        .eq('id', id);

      if (error) {
        console.error('Error marking mention as read:', error);
      }
    }

    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const deleteNotification = async (id: string, type: 'notification' | 'mention') => {
    const table = type === 'notification' ? 'notifications' : 'mentions';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${type}:`, error);
    } else {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 z-50">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500">No notifications</p>
              ) : (
                <ul className="space-y-4">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`flex items-start justify-between ${
                        notif.read ? 'opacity-50' : ''
                      }`}
                    >
                      <div>
                        {notif.type === 'mention' && <AtSign className="inline-block h-4 w-4 mr-1" />}
                        <p className="text-sm">
                          {notif.type === 'mention' 
                            ? `${notif.details?.mentioned_by || 'Someone'} mentioned you: "${notif.message}"`
                            : notif.details?.task_title 
                              ? `Task "${notif.details.task_title}" (ID: ${notif.details.task_id}): ${notif.message}`
                              : notif.message
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!notif.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notif.id, notif.type)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notif.id, notif.type)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}