import { Bot, MessageSquare, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIAssistantPromoProps {
  onOpenChat: (question?: string) => void;
}

export function AIAssistantPromo({ onOpenChat }: AIAssistantPromoProps) {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-secondary/30 to-accent/5">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          {/* Icon */}
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <Bot className="h-10 w-10" />
              </div>
              <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground animate-pulse-soft">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
            {t('home.aiAssistant')}
          </h2>
          
          <p className="mb-8 text-lg text-muted-foreground">
            {t('home.aiAssistantDesc')}
          </p>

          {/* Features */}
          <div className="mb-10 flex flex-wrap justify-center gap-4">
            {[
              { icon: MessageSquare, text: 'Подбор ВУЗа по критериям' },
              { icon: Zap, text: 'Мгновенные ответы' },
              { icon: Sparkles, text: 'Персональные рекомендации' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm shadow-sm"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            size="lg"
            onClick={() => onOpenChat()}
            className="gap-2 bg-primary shadow-glow hover:bg-primary/90"
          >
            <MessageSquare className="h-5 w-5" />
            Задать вопрос AI
          </Button>

          {/* Sample Questions */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              'Какой ВУЗ для IT в Алматы?',
              'Где есть гранты на медицину?',
              'Сравни КазНУ и КБТУ',
            ].map((question, idx) => (
              <button
                key={idx}
                onClick={() => onOpenChat(question)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
