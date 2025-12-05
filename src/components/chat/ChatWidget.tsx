import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const suggestions = [
    'Лучшие IT ВУЗы в Алматы',
    'ВУЗы с грантами на медицину',
    'Сравни КазНУ и КБТУ',
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual AI call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(input),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('it') || lowerQuery.includes('ит')) {
      return 'Для IT-специальностей в Алматы рекомендую:\n\n1. **КазНУ им. аль-Фараби** - рейтинг #1, 96% трудоустройство\n2. **КБТУ** - британские стандарты, партнерство с топ IT-компаниями\n3. **МУИТ** - специализированный IT-университет\n\nХотите сравнить эти ВУЗы?';
    }
    
    if (lowerQuery.includes('медицин') || lowerQuery.includes('врач')) {
      return 'Лучшие медицинские ВУЗы Казахстана:\n\n1. **КазНМУ им. Асфендиярова** - #1 в медицине, 90+ лет истории\n2. **Назарбаев Университет** - медицинская школа мирового уровня\n\nМинимальный балл ЕНТ: 75-85 баллов. Гранты доступны!';
    }
    
    if (lowerQuery.includes('сравни') || lowerQuery.includes('compare')) {
      return 'Перейдите в раздел "Сравнение" чтобы сравнить до 4 университетов по параметрам:\n\n• Рейтинг\n• Стоимость обучения\n• Программы\n• Инфраструктура\n• Партнерства\n\nМогу помочь выбрать критерии для сравнения!';
    }
    
    return 'Я помогу выбрать подходящий университет! Расскажите:\n\n• Какое направление вас интересует?\n• Предпочтительный город?\n• Важны ли гранты?\n\nИли выберите один из популярных вопросов выше.';
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

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
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] animate-slide-up">
          <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-primary-foreground">
                    {t('chat.title')}
                  </h3>
                  <p className="text-xs text-primary-foreground/70">Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-3 text-sm">
                      {t('chat.welcome')}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pl-11">
                    {suggestions.map((suggestion, idx) => (
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
                          <Bot className="h-4 w-4 text-primary" />
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
                  
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
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
