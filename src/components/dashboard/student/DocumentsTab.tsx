import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Upload, Trash2, Download, Eye, Plus, 
  File, FileCheck, Loader2 
} from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const documentTypes = [
  { value: 'certificate', label: 'Аттестат' },
  { value: 'diploma', label: 'Диплом' },
  { value: 'motivation_letter', label: 'Мотивационное письмо' },
  { value: 'recommendation', label: 'Рекомендательное письмо' },
  { value: 'ent_result', label: 'Результаты ЕНТ' },
  { value: 'passport', label: 'Удостоверение личности' },
  { value: 'photo', label: 'Фото 3x4' },
  { value: 'other', label: 'Другое' },
];

export function DocumentsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('certificate');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['user-documents', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-documents')
        .getPublicUrl(fileName);
      
      // Create document record
      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user?.id,
          title: newDocTitle || file.name,
          document_type: newDocType,
          file_url: publicUrl,
        });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      toast({ title: 'Документ загружен' });
      setShowUploadForm(false);
      setNewDocTitle('');
      setNewDocType('certificate');
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      toast({ title: 'Документ удалён' });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Файл слишком большой', description: 'Максимум 10 МБ', variant: 'destructive' });
      return;
    }
    
    setIsUploading(true);
    await uploadMutation.mutateAsync(file);
    setIsUploading(false);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'certificate':
      case 'diploma':
        return <FileCheck className="h-10 w-10 text-primary" />;
      default:
        return <File className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Мои документы
            </CardTitle>
            <CardDescription>
              Храните сканы документов для быстрого доступа при подаче заявок
            </CardDescription>
          </div>
          <Button onClick={() => setShowUploadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Загрузить
          </Button>
        </CardHeader>
        <CardContent>
          {/* Upload Form */}
          {showUploadForm && (
            <Card className="mb-6 border-dashed">
              <CardContent className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Название документа</Label>
                    <Input
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="Например: Аттестат 2024"
                    />
                  </div>
                  <div>
                    <Label>Тип документа</Label>
                    <Select value={newDocType} onValueChange={setNewDocType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label 
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? 'Загрузка...' : 'Выбрать файл'}
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <Button variant="ghost" onClick={() => setShowUploadForm(false)}>
                    Отмена
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX. Максимум 10 МБ.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Documents List */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : documents?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Документов пока нет</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Загрузите сканы документов для удобного хранения
              </p>
              <Button onClick={() => setShowUploadForm(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Загрузить первый документ
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents?.map(doc => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getDocumentIcon(doc.document_type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {documentTypes.find(t => t.value === doc.document_type)?.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(doc.uploaded_at), 'd MMM yyyy', { locale: ru })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-1" />
                          Открыть
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a href={doc.file_url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeleteId(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
        title="Удалить документ?"
        description="Документ будет удалён без возможности восстановления."
      />
    </div>
  );
}
