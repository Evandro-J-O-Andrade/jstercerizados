import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { MessageCircle, X, Send, Headphones, ChevronRight, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
import { sendChatRequest } from '@/lib/chat-client';

type ChatRole = 'user' | 'assistant' | 'system';
interface Message { id: string; role: ChatRole; content: string; timestamp: Date; options?: { label: string; value: string }[] }

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

export function ChatWidget({ isOpen, onOpenChange, onHumanHandoff }: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onHumanHandoff?: (context: { subject: string }) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', role: 'assistant', content: 'Olá! 👋 Sou a assistente virtual da J&S. Posso ajudar você com vagas, oportunidades, serviços de RH ou atendimento para empresas.', timestamp: new Date(), options: initialOptions,
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handoff = async (subject = 'Atendimento humano') => {
    const context = {
      conversationId: `web-${Date.now()}`,
      intent: 'human_support',
      page: window.location.pathname,
      messages: messages.map(({ role, content }) => ({ role, content })),
    };
    try {
      await fetch('/api/handoff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(context) });
    } catch (error) { console.error('Human handoff request failed:', error); }
    localStorage.setItem('js_chat_handoff', JSON.stringify({ subject, createdAt: new Date().toISOString() }));
    setOpen(false);
    onHumanHandoff?.({ subject });
  };

  const getAIReply = async (nextMessages: Message[]) => {
    const result = await sendChatRequest(nextMessages.filter((m) => m.role === 'user' || m.role === 'assistant').map((m) => ({ role: m.role, content: m.content })));
    return result.ok && result.reply ? result.reply : 'Não consegui concluir essa resposta agora. Posso encaminhar você para um atendente humano.';
  };

  const submit = async (text: string, optionValue?: string) => {
    const content = text.trim();
    if (!content || isTyping) return;
    if (optionValue === 'human_support') { await handoff('Atendimento solicitado pelo visitante'); return; }

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content, timestamp: new Date() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages); setInputValue(''); setIsTyping(true);
    try {
      const reply = await getAIReply(nextMessages);
      let options: Message['options'];
      if (optionValue === 'candidate') options = candidateOptions;
      if (optionValue === 'company') options = companyOptions;
      const assistant: Message = { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: new Date(), options };
      setMessages((prev) => [...prev, assistant]);
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Estou com dificuldade para responder agora. Posso encaminhar você para nossa equipe.', timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  const handleOptionClick = (value: string) => {
    const all = [...initialOptions, ...candidateOptions, ...companyOptions];
    const label = all.find((o) => o.value === value)?.label ?? value;
    void submit(label, value);
  };
  const handleSend = () => void submit(inputValue);

  const chatPanelRef = useFocusTrap(open);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) setOpen(false); };
    document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  return <div className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom)-10px)] z-50 sm:right-6 sm:bottom-16">
    <AnimatePresence>
      {open && <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay-backdrop fixed inset-0 z-[60]" onClick={() => setOpen(false)} aria-hidden="true" />
        <motion.div id="chat-panel" ref={chatPanelRef} role="dialog" aria-modal="true" aria-labelledby="chat-title" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="overlay-panel relative z-[70] mb-3 flex w-[calc(100vw-2rem)] max-w-[360px] flex-col">
          <div className="bg-background border-border flex h-[60vh] max-h-[500px] flex-col overflow-hidden rounded-2xl border shadow-2xl">
            <div className="bg-primary/10 border-border/50 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3"><div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full"><MessageCircle className="h-4 w-4" /></div><div><h3 id="chat-title" className="text-foreground text-sm font-semibold">Assistente J&S</h3><p className="text-muted-foreground text-xs">IA • Online</p></div></div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none" aria-label="Fechar chat"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => <div key={message.id} className={cn('flex gap-2', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                {message.role !== 'user' && <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full"><Bot className="h-4 w-4" /></div>}
                <div className={cn('max-w-[82%] rounded-2xl px-4 py-2 text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.options && <div className="mt-3 space-y-2">{message.options.map((option) => <button key={option.value} onClick={() => handleOptionClick(option.value)} className="bg-background hover:bg-primary/10 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors"><span>{option.label}</span><ChevronRight className="text-muted-foreground h-3 w-3" /></button>)}</div>}
                </div>
              </div>)}
              {isTyping && <div className="flex items-center gap-2"><div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full"><Bot className="h-4 w-4" /></div><div className="bg-muted rounded-2xl px-4 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-border/50 border-t p-3">
              <button type="button" onClick={() => void handoff()} className="text-primary mb-2 flex items-center gap-1 text-xs font-semibold"><Headphones className="h-3.5 w-3.5" /> Falar com atendimento humano</button>
              <div className="flex items-center gap-2"><input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Digite sua mensagem..." disabled={isTyping} className="bg-background border-border focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm outline-none disabled:opacity-50" /><Button variant="primary" size="icon" onClick={handleSend} disabled={!inputValue.trim() || isTyping} aria-label="Enviar mensagem"><Send className="h-4 w-4" /></Button></div>
            </div>
          </div>
        </motion.div>
      </>}
    </AnimatePresence>
    <motion.button onClick={() => setOpen(!open)} className="shadow-glow-lg bg-primary text-primary-foreground relative z-[60] flex items-center gap-2 rounded-full px-4 py-3 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label={open ? 'Fechar chat' : 'Abrir assistente J&S'} aria-expanded={open} aria-controls="chat-panel">
      {open ? <X className="h-5 w-5" /> : <><MessageCircle className="h-5 w-5" /><span className="hidden text-sm font-medium sm:inline">Fale com a J&S</span></>}
    </motion.button>
  </div>;
}
