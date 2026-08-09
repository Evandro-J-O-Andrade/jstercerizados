import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import type { ChatMessage, ChatRoom } from '@/types/chat';
import type { SupabaseClient } from '@supabase/supabase-js';

export function useRealtimeChat(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<SupabaseClient['channel']> | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadInitialData = async () => {
      const { data: roomData } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomData) {
        setRoom(roomData as ChatRoom);
      }

      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData as ChatMessage[]);
      }

      setLoading(false);
    };

    loadInitialData();

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: { new: ChatMessage }) => {
          const newMessage = payload.new;
          setMessages((prev) => [...prev, newMessage]);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    if (!roomId || !content.trim()) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      role: 'visitor',
      content: content.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const closeRoom = async () => {
    if (!roomId) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('chat_rooms')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', roomId);

    if (error) {
      console.error('Error closing room:', error);
    }
  };

  return {
    messages,
    room,
    loading,
    sendMessage,
    closeRoom,
  };
}
