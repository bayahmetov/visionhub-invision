import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Target, Briefcase, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type ChatMode = 'general' | 'twin' | 'alternatives' | 'career';

const modes = [
  { value: 'general', label: 'Общие вопросы', icon: MessageCircle, description: 'Ответы на вопросы о вузах' },
  { value: 'twin', label: 'Образовательный близнец', icon: Sparkles, description: 'Персональные рекомендации' },
  { value: 'alternatives', label: 'План Б', icon: Target, description: 'Альтернативные пути' },
  { value: 'career', label: 'Карьерный путь', icon: Briefcase, description: 'Перспективы после вуза' },
] as const;

const CHAT_URL = 'https://wqrpnmhmztufgmdovyim.supabase.co/functions/v1/ai-chat';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('general');
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user profile for personalized recommendations
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-for-chat', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('ent_score, expected_ent_score, english_level, target_degree, budget_max_kzt, interests, preferred_cities, willing_to_relocate')
        .eq('id', user?.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  const getSuggestions = () => {
    switch (mode) {
      case 'twin':
        return [
          'Оцени мои шансы на грант',
          'Какие вузы мне подходят?',
          'Что мне подтянуть?',
        ];
      case 'alternatives':
        return [
          'Если не поступлю в КазНУ',
          'Альтернативы медицинскому',
          'План Б для IT специальности',
        ];
      case 'career':
        return [
          'Карьера после Computer Science',
          'Зарплаты экономистов в РК',
          'Перспективы юристов',
        ];
      default:
        return [
          'Лучшие IT ВУЗы в Алматы',
          'ВУЗы с грантами на медицину',
          'Как подать на грант?',
        ];
    }
  };

  const getWelcomeMessage = () => {
    const currentMode = modes.find(m => m.value === mode);
    if (mode === 'twin' && userProfile) {
      return `Привет! Я твой образовательный близнец 🎓 Я вижу твой профиль${userProfile.ent_score ? ` (ЕНТ: ${userProfile.ent_score})` : ''}. Спроси меня о шансах поступления, подходящих вузах или что подтянуть!`;
    }
    if (mode === 'alternatives') {
      return 'Привет! Я помогу найти альтернативные пути к образованию. Назови целевой вуз или программу, и я покажу План А, Б и В!';
    }
    if (mode === 'career') {
      return 'Привет! Я симулятор карьеры 💼 Спроси о перспективах любой специальности — покажу путь через 1, 3 и 5 лет после выпуска.';
    }
    return t('chat.welcome');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear messages when mode changes
  useEffect(() => {
    setMessages([]);
  }, [mode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcnBubWhtenR1ZmdtZG92eWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjIzODcsImV4cCI6MjA4MDQ5ODM4N30.6q9ZdU89LJnBRSZoEMnxoS1Lan6J1IRDBHqDlat3iCc`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          language,
          mode,
          userProfile: mode !== 'general' ? userProfile : null,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error('Слишком много запросов. Попробуйте позже.');
        } else if (resp.status === 402) {
          toast.error('Требуется оплата. Добавьте кредиты.');
        } else {
          toast.error('Ошибка AI сервиса');
        }
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: assistantContent }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Не удалось получить ответ от AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const currentModeConfig = modes.find(m => m.value === mode)!;
  const ModeIcon = currentModeConfig.icon;

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'transition-all hover:scale-110',
          isOpen && 'hidden'
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] animate-slide-up">
          <div className="flex h-[550px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <ModeIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-primary-foreground">
                    {currentModeConfig.label}
                  </h3>
                  <p className="text-xs text-primary-foreground/70">{currentModeConfig.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground hover:bg-primary-foreground/20 gap-1"
                    >
                      Режим
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {modes.map((m) => (
                      <DropdownMenuItem
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        className={cn('gap-2', mode === m.value && 'bg-primary/10')}
                      >
                        <m.icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-xs text-muted-foreground">{m.description}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <ModeIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-3 text-sm">
                      {getWelcomeMessage()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pl-11">
                    {getSuggestions().map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestion(suggestion)}
                        className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/10"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          message.role === 'user'
                            ? 'bg-accent'
                            : 'bg-primary/10'
                        )}
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-accent-foreground" />
                        ) : (
                          <ModeIcon className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line',
                          message.role === 'user'
                            ? 'rounded-tr-none bg-primary text-primary-foreground'
                            : 'rounded-tl-none bg-muted'
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <ModeIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-3">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
