import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, GripVertical, Star, MapPin, Users, Trash2, 
  Download, FileText, ExternalLink, ArrowUp, ArrowDown 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function WishlistTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites-with-priority', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          universities (
            id, name_ru, city, region, type, students_count, 
            logo_url, ranking_national, has_grants
          )
        `)
        .eq('user_id', user?.id)
        .order('priority', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: number }) => {
      const { error } = await supabase
        .from('favorites')
        .update({ priority })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites-with-priority'] });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('favorites')
        .update({ notes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites-with-priority'] });
      toast({ title: 'Заметка сохранена' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites-with-priority'] });
      toast({ title: 'Удалено из избранного' });
      setDeleteId(null);
    },
  });

  const movePriority = (id: string, currentPriority: number, direction: 'up' | 'down') => {
    const newPriority = direction === 'up' ? currentPriority + 1 : Math.max(0, currentPriority - 1);
    updatePriorityMutation.mutate({ id, priority: newPriority });
  };

  const exportToPDF = () => {
    if (!favorites || favorites.length === 0) return;

    const content = favorites.map((fav, index) => {
      const uni = fav.universities;
      return `
${index + 1}. ${uni?.name_ru}
   📍 ${uni?.city}, ${uni?.region}
   🏆 Рейтинг: ${uni?.ranking_national || 'Н/Д'}
   👥 Студентов: ${uni?.students_count?.toLocaleString() || 'Н/Д'}
   ${uni?.has_grants ? '✅ Есть гранты' : ''}
   ${fav.notes ? `📝 Заметка: ${fav.notes}` : ''}
      `.trim();
    }).join('\n\n');

    const text = `
СПИСОК ИЗБРАННЫХ ВУЗОВ
Дата: ${new Date().toLocaleDateString('ru-RU')}

${content}

---
Сгенерировано на DataHub ВУЗов
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wishlist.txt';
    a.click();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'national': return 'Национальный';
      case 'state': return 'Государственный';
      case 'private': return 'Частный';
      case 'international': return 'Международный';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Список желаний
            </CardTitle>
            <CardDescription>
              Ваши избранные ВУЗы с приоритетами и заметками
            </CardDescription>
          </div>
          {favorites && favorites.length > 0 && (
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : favorites?.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Список пуст</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Добавляйте ВУЗы в избранное для создания списка
              </p>
              <Button asChild>
                <Link to="/universities">Смотреть ВУЗы</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites?.map((fav, index) => (
                <Card key={fav.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Priority Badge */}
                      <div className="flex flex-col items-center gap-1">
                        <Badge 
                          variant={index === 0 ? 'default' : 'secondary'}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => movePriority(fav.id, fav.priority || 0, 'up')}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => movePriority(fav.id, fav.priority || 0, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* University Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {fav.universities?.logo_url ? (
                            <img 
                              src={fav.universities.logo_url} 
                              alt="" 
                              className="w-12 h-12 rounded-lg object-contain bg-muted"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <Star className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Link 
                              to={`/universities/${fav.universities?.id}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {fav.universities?.name_ru}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {fav.universities?.city}
                              {fav.universities?.ranking_national && (
                                <>
                                  <span>•</span>
                                  <span>#{fav.universities.ranking_national} в РК</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">
                            {getTypeLabel(fav.universities?.type || '')}
                          </Badge>
                          {fav.universities?.has_grants && (
                            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                              Гранты
                            </Badge>
                          )}
                          {fav.universities?.students_count && (
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {fav.universities.students_count.toLocaleString()}
                            </Badge>
                          )}
                        </div>

                        {/* Notes */}
                        <Input
                          placeholder="Добавить заметку..."
                          defaultValue={fav.notes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (fav.notes || '')) {
                              updateNotesMutation.mutate({ 
                                id: fav.id, 
                                notes: e.target.value 
                              });
                            }
                          }}
                          className="text-sm"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/universities/${fav.universities?.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(fav.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Удалить из избранного?"
        description="ВУЗ будет удалён из вашего списка."
      />
    </div>
  );
}
