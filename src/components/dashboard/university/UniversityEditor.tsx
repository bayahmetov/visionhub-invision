import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface UniversityEditorProps {
  university: any;
  onUpdate: () => void;
}

export default function UniversityEditor({ university, onUpdate }: UniversityEditorProps) {
  const [formData, setFormData] = useState(university);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('universities')
      .update({
        description_ru: formData.description_ru,
        description_kz: formData.description_kz,
        description_en: formData.description_en,
        mission_ru: formData.mission_ru,
        mission_kz: formData.mission_kz,
        mission_en: formData.mission_en,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        students_count: formData.students_count,
        teachers_count: formData.teachers_count,
        has_dormitory: formData.has_dormitory,
        has_military_department: formData.has_military_department,
        has_grants: formData.has_grants,
        virtual_tour_url: formData.virtual_tour_url
      })
      .eq('id', university.id);

    setSaving(false);

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Успешно', description: 'Данные сохранены' });
      onUpdate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация о ВУЗе</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Название (RU)</Label>
            <Input value={formData.name_ru || ''} disabled />
          </div>
          <div>
            <Label>Город</Label>
            <Input value={formData.city || ''} disabled />
          </div>
        </div>

        <div>
          <Label>Описание (RU)</Label>
          <Textarea
            value={formData.description_ru || ''}
            onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label>Описание (KZ)</Label>
          <Textarea
            value={formData.description_kz || ''}
            onChange={(e) => setFormData({ ...formData, description_kz: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label>Миссия (RU)</Label>
          <Textarea
            value={formData.mission_ru || ''}
            onChange={(e) => setFormData({ ...formData, mission_ru: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Website</Label>
            <Input
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Телефон</Label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Адрес</Label>
          <Input
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Количество студентов</Label>
            <Input
              type="number"
              value={formData.students_count || ''}
              onChange={(e) => setFormData({ ...formData, students_count: parseInt(e.target.value) || null })}
            />
          </div>
          <div>
            <Label>Количество преподавателей</Label>
            <Input
              type="number"
              value={formData.teachers_count || ''}
              onChange={(e) => setFormData({ ...formData, teachers_count: parseInt(e.target.value) || null })}
            />
          </div>
        </div>

        <div>
          <Label>Ссылка на виртуальный тур</Label>
          <Input
            value={formData.virtual_tour_url || ''}
            onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.has_dormitory || false}
              onCheckedChange={(v) => setFormData({ ...formData, has_dormitory: v })}
            />
            <Label>Общежитие</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.has_military_department || false}
              onCheckedChange={(v) => setFormData({ ...formData, has_military_department: v })}
            />
            <Label>Военная кафедра</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.has_grants || false}
              onCheckedChange={(v) => setFormData({ ...formData, has_grants: v })}
            />
            <Label>Гранты</Label>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </CardContent>
    </Card>
  );
}
