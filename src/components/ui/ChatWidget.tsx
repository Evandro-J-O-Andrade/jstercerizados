import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  MessageCircle,
  X,
  Send,
  User,
  Headphones,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
import { sendChatRequest } from '@/lib/chat-client';

type ChatRole = 'user' | 'assistant' | 'system' | 'agent';

interface Message {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  options?: { label: string; value: string }[];
  agentName?: string;
}

type ChatMode = 'ai' | 'human';

const initialOptions = [
  { label: 'Sou candidato', value: 'candidate' },
  { label: 'Sou empresa', value: 'company' },
  { label: 'Quero saber sobre uma vaga', value: 'job_info' },
  { label: 'Quero contratar profissionais', value: 'hire' },
  { label: 'Falar com atendimento humano', value: 'human_support' },
];

const candidateOptions = [
  { label: 'Como cadastro meu currículo?', value: 'how_to_register' },
  { label: 'Como funciona o processo seletivo?', value: 'how_selection_works' },
  { label: 'Onde vejo as vagas?', value: 'where_to_see_jobs' },
  { label: 'Falar com atendimento humano', value: 'human_support' },
];

const companyOptions = [
  { label: 'Como minha empresa pode contratar?', value: 'how_to_hire' },
  { label: 'Quais são os serviços de RH?', value: 'rh_services' },
  { label: 'Solicitar orçamento', value: 'request_quote' },
  { label: 'Falar com atendimento humano', value: 'human_support' },
];

export function ChatWidget({
  isOpen,
  onOpenChange,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [mode, setMode] = useState<ChatMode>('ai');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Como podemos ajudar?',
      timestamp: new Date(),
      options: initialOptions,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startHumanChat = () => {
    setMode('human');
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'system',
        content:
          'Você foi conectado com um atendente. Em breve alguém irá responder.',
        timestamp: new Date(),
      },
    ]);
  };

  const getAIReply = async (userText: string): Promise<string> => {
    const result = await sendChatRequest([{ role: 'user', content: userText }]);

    if (result.ok && result.reply) {
      return result.reply;
    }

    return 'Obrigado pela sua mensagem! Em breve um atendente irá te responder. Enquanto isso, você pode escolher uma das opções abaixo:';
  };

  const handleOptionClick = (value: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: initialOptions.find((o) => o.value === value)?.label || value,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const respond = async () => {
      try {
        const responseContent = await getAIReply(userMessage.content);
        let nextOptions: Message['options'] | undefined;

        if (value === 'candidate') {
          nextOptions = candidateOptions;
        } else if (value === 'company') {
          nextOptions = companyOptions;
        } else if (value === 'support' || value === 'human_support') {
          startHumanChat();
          setIsTyping(false);
          return;
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          options: nextOptions,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Em breve um atendente irá te responder.',
          timestamp: new Date(),
          options: initialOptions,
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsTyping(false);
      }
    };

    void respond();
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const respond = async () => {
      try {
        const reply = await getAIReply(userMessage.content);

        if (mode === 'human') {
          const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'agent',
            content:
              'Obrigado pelo contato. Um atendente já foi notificado e responderá em instantes.',
            timestamp: new Date(),
            agentName: 'Atendente',
          };
          setMessages((prev) => [...prev, agentMessage]);
        } else {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
            options: initialOptions,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'Obrigado pela sua mensagem! Em breve um atendente irá te responder. Enquanto isso, você pode escolher uma das opções abaixo:',
          timestamp: new Date(),
          options: initialOptions,
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsTyping(false);
      }
    };

    void respond();
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
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const chatPanelRef = useFocusTrap(open);

  return (
    <div className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom)-10px)] z-50 sm:right-6 sm:bottom-16">
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overlay-backdrop fixed inset-0 z-[60]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="chat-panel"
              ref={chatPanelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-title"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="overlay-panel relative z-[70] mb-3 flex w-[calc(100vw-2rem)] max-w-[360px] flex-col sm:mb-3"
            >
              <div className="bg-background border-border flex h-[60vh] max-h-[500px] flex-col overflow-hidden rounded-2xl border shadow-2xl">
                <div className="bg-primary/10 border-border/50 flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3
                        id="chat-title"
                        className="text-foreground text-sm font-semibold"
                      >
                        {mode === 'ai'
                          ? 'Assistente J&S'
                          : 'Atendimento Humano'}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {mode === 'ai'
                          ? 'Assistente IA • Online'
                          : 'Atendente online'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
                    aria-label="Fechar chat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((message) => (
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
                        {message.options && (
                          <div className="mt-3 space-y-2">
                            {message.options.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleOptionClick(option.value)}
                                className="bg-background hover:bg-primary/10 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors"
                              >
                                <span>{option.label}</span>
                                <ChevronRight className="text-muted-foreground h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        {mode === 'human' ? (
                          <Headphones className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <span className="bg-foreground/20 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                          <span className="bg-foreground/20 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                          <span className="bg-foreground/20 h-2 w-2 animate-bounce rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-border/50 border-t p-3">
                  {mode === 'ai' ? (
                    <button
                      type="button"
                      onClick={startHumanChat}
                      className="text-primary mb-2 text-xs font-semibold"
                    >
                      Falar com atendente humano
                    </button>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={
                        mode === 'ai'
                          ? 'Digite sua mensagem...'
                          : 'Mensagem para atendente...'
                      }
                      className="bg-background border-border focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                    />
                    <Button
                      variant="primary"
                      size="icon"
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
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
          'shadow-glow-lg bg-primary text-primary-foreground relative z-[60] flex items-center gap-2 rounded-full px-4 py-3 transition-colors',
          open ? 'rounded-full' : 'rounded-full',
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Fechar chat' : 'Abrir chat online'}
        aria-expanded={open}
        aria-controls="chat-panel"
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
