import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { getSupabaseClient } from '@/lib/supabase';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { X, Send, User, Headphones, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

type ChatRole = 'user' | 'assistant' | 'system' | 'agent';

interface Message {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export function HumanChatWidget({
  isOpen,
  onOpenChange,
  subject,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  subject?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Conectando com atendente...',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [connecting, setConnecting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages: realtimeMessages,
    loading,
    sendMessage,
  } = useRealtimeChat(roomId);

  useEffect(() => {
    if (realtimeMessages.length > 0) {
      setMessages(realtimeMessages as unknown as Message[]);
    }
  }, [realtimeMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const createRoom = async () => {
      const visitorId =
        localStorage.getItem('chat_visitor_id') ||
        `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('chat_visitor_id', visitorId);

      const supabase = getSupabaseClient();
      if (!supabase) {
        setConnecting(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          visitor_id: visitorId,
          status: 'waiting',
          subject: subject || 'Atendimento humano',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat room:', error);
        setConnecting(false);
        return;
      }

      setRoomId(data.id);
      setConnecting(false);
    };

    if (open && !roomId) {
      createRoom();
    }
  }, [open, roomId, subject]);

  const handleSend = async () => {
    if (!inputValue.trim() || !roomId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    await sendMessage(inputValue);
  };

  const handleClose = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setOpen(false);
      return;
    }

    if (roomId) {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ status: 'closed' })
        .eq('id', roomId);

      if (error) {
        console.error('Error closing chat room:', error);
      }
    }
    setOpen(false);
  };

  const getRoleIcon = (role: ChatRole) => {
    switch (role) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'agent':
        return <Headphones className="h-4 w-4" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const chatPanelRef = useFocusTrap(open);

  return (
    <div className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 sm:right-6 sm:bottom-8">
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overlay-backdrop fixed inset-0 z-40"
              onClick={handleClose}
              aria-hidden="true"
            />
            <motion.div
              id="human-chat-panel"
              ref={chatPanelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="human-chat-title"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="overlay-panel relative z-50 mb-3 flex w-[calc(100vw-2rem)] max-w-[360px] flex-col sm:mb-3"
            >
              <div className="bg-background border-border flex h-[60vh] max-h-[500px] flex-col overflow-hidden rounded-2xl border shadow-2xl">
                <div className="bg-primary/10 border-border/50 flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div>
                      <h3
                        id="human-chat-title"
                        className="text-foreground text-sm font-semibold"
                      >
                        Atendimento Humano
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {connecting
                          ? 'Conectando...'
                          : loading
                            ? 'Carregando...'
                            : 'Atendente online'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
                    aria-label="Fechar chat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {connecting ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-2',
                          message.role === 'user'
                            ? 'flex-row-reverse'
                            : 'flex-row',
                        )}
                      >
                        {message.role !== 'user' && (
                          <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                            {getRoleIcon(message.role)}
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground',
                          )}
                        >
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-border/50 border-t p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Mensagem para atendente..."
                      disabled={connecting || loading}
                      className="bg-background border-border focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm outline-none disabled:opacity-50"
                    />
                    <Button
                      variant="primary"
                      size="icon"
                      onClick={handleSend}
                      disabled={!inputValue.trim() || connecting || loading}
                      aria-label="Enviar mensagem"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        className={cn(
          'shadow-glow-lg bg-primary text-primary-foreground flex items-center gap-2 rounded-full px-4 py-3 transition-colors',
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Fechar chat humano' : 'Abrir atendimento humano'}
        aria-expanded={open}
        aria-controls="human-chat-panel"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <Headphones className="h-5 w-5" />
            <span className="hidden text-sm font-medium sm:inline">
              Fale com atendente
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
