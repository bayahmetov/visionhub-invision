import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface University {
  id: string;
  name_ru: string;
}

interface ReviewFormProps {
  onSuccess: () => void;
}

export default function ReviewForm({ onSuccess }: ReviewFormProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const { data } = await supabase
      .from('universities')
      .select('id, name_ru')
      .order('name_ru');
    if (data) setUniversities(data);
  };

  const handleSubmit = async () => {
    if (!selectedUniversity || rating === 0) {
      toast({ title: 'Ошибка', description: 'Выберите ВУЗ и оценку', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('reviews').upsert({
      user_id: user!.id,
      university_id: selectedUniversity,
      rating,
      comment: comment || null
    }, { onConflict: 'user_id,university_id' });

    setLoading(false);

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: 'Отзыв сохранен' });
      setSelectedUniversity('');
      setRating(0);
      setComment('');
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оставить отзыв</CardTitle>
        <CardDescription>Поделитесь впечатлениями о ВУЗе</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите ВУЗ" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id}>{uni.name_ru}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Оценка</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star 
                  className={`h-6 w-6 ${value <= rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Ваш комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading}>
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </CardContent>
    </Card>
  );
}
