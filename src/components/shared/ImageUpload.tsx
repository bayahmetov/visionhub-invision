import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  aspectRatio?: 'square' | 'wide' | 'cover';
}

export function ImageUpload({ label, value, onChange, folder, aspectRatio = 'square' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    cover: 'aspect-[3/1]',
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Ошибка', description: 'Выберите изображение', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Ошибка', description: 'Максимальный размер файла 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('university-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('university-images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast({ title: 'Успешно', description: 'Изображение загружено' });
    } catch (error: any) {
      toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className={`relative border-2 border-dashed rounded-lg overflow-hidden ${aspectClasses[aspectRatio]} bg-muted`}>
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-sm">Нет изображения</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Загрузка...' : value ? 'Заменить' : 'Загрузить'}
        </Button>
      </div>
    </div>
  );
}
