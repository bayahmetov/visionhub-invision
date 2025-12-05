import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, Circle, Target, BookOpen, FileText, 
  GraduationCap, Send, Star, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultTasks = [
  { key: 'profile', title_ru: 'Заполнить профиль абитуриента', icon: '👤', sort_order: 1 },
  { key: 'interests', title_ru: 'Определить интересующие направления', icon: '🎯', sort_order: 2 },
  { key: 'ent_prep', title_ru: 'Подготовиться к ЕНТ', icon: '📚', sort_order: 3 },
  { key: 'universities', title_ru: 'Выбрать топ-5 ВУЗов', icon: '🏛️', sort_order: 4 },
  { key: 'programs', title_ru: 'Сравнить программы обучения', icon: '📊', sort_order: 5 },
  { key: 'documents', title_ru: 'Собрать документы', icon: '📄', sort_order: 6 },
  { key: 'motivation', title_ru: 'Написать мотивационное письмо', icon: '✍️', sort_order: 7 },
  { key: 'apply', title_ru: 'Подать заявки', icon: '📨', sort_order: 8 },
  { key: 'interview', title_ru: 'Пройти собеседование (если требуется)', icon: '🎤', sort_order: 9 },
  { key: 'decision', title_ru: 'Получить решение и выбрать ВУЗ', icon: '🎉', sort_order: 10 },
];

export function RoadmapTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['roadmap-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roadmap_tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Initialize tasks if empty
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const tasksToInsert = defaultTasks.map(task => ({
        user_id: user?.id,
        task_key: task.key,
        title_ru: task.title_ru,
        sort_order: task.sort_order,
        is_completed: false,
      }));
      
      const { error } = await supabase
        .from('user_roadmap_tasks')
        .upsert(tasksToInsert, { onConflict: 'user_id,task_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-tasks'] });
    },
  });

  useEffect(() => {
    if (tasks && tasks.length === 0 && user?.id) {
      initializeMutation.mutate();
    }
  }, [tasks, user?.id]);

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('user_roadmap_tasks')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-tasks'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const completedCount = tasks?.filter(t => t.is_completed).length || 0;
  const totalCount = tasks?.length || defaultTasks.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const displayTasks = tasks && tasks.length > 0 
    ? tasks 
    : defaultTasks.map(t => ({ ...t, id: t.key, is_completed: false }));

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Дорожная карта поступления</h3>
                <p className="text-sm text-muted-foreground">
                  Следуйте шагам для успешного поступления
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">{completedCount}</span>
              <span className="text-lg text-muted-foreground">/{totalCount}</span>
              <p className="text-xs text-muted-foreground">выполнено</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Прогресс: {progress}%</span>
            {progress === 100 && (
              <span className="text-accent flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Отлично! Все шаги выполнены!
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Шаги к поступлению</CardTitle>
          <CardDescription>
            Отмечайте выполненные задачи для отслеживания прогресса
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {displayTasks.map((task, index) => {
                const defaultTask = defaultTasks.find(t => t.key === task.task_key);
                const icon = defaultTask?.icon || '📋';
                
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border transition-all',
                      task.is_completed 
                        ? 'bg-accent/10 border-accent/30' 
                        : 'bg-card hover:bg-muted/50'
                    )}
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={(checked) => {
                        if (tasks && tasks.length > 0) {
                          toggleTaskMutation.mutate({ 
                            taskId: task.id, 
                            completed: !!checked 
                          });
                        }
                      }}
                      disabled={!tasks || tasks.length === 0}
                    />
                    
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className={cn(
                          'font-medium',
                          task.is_completed && 'line-through text-muted-foreground'
                        )}>
                          {task.title_ru}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Шаг {index + 1} из {totalCount}
                        </p>
                      </div>
                    </div>

                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Полезные советы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">📅 Сроки подачи</h4>
              <p className="text-sm text-muted-foreground">
                Следите за дедлайнами в календаре событий. Не откладывайте подачу документов!
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">📊 Сравнение</h4>
              <p className="text-sm text-muted-foreground">
                Используйте функцию сравнения ВУЗов и программ для осознанного выбора.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">🤖 AI-помощник</h4>
              <p className="text-sm text-muted-foreground">
                Задайте вопросы AI-консультанту — он поможет с выбором и подготовкой.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">💾 Документы</h4>
              <p className="text-sm text-muted-foreground">
                Храните сканы документов в профиле для быстрого доступа.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
