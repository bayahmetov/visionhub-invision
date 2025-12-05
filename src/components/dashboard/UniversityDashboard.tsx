import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, BookOpen, Handshake, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import UniversityEditor from './university/UniversityEditor';
import ProgramsEditor from './university/ProgramsEditor';
import PartnershipsEditor from './university/PartnershipsEditor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UniversityDashboard() {
  const { signOut, user, universityId } = useAuth();
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (universityId) {
      fetchUniversity();
    } else {
      setLoading(false);
    }
  }, [universityId]);

  const fetchUniversity = async () => {
    const { data } = await supabase
      .from('universities')
      .select('*')
      .eq('id', universityId)
      .maybeSingle();
    
    setUniversity(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!universityId || !university) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Панель ВУЗа</h1>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Университет не привязан</AlertTitle>
          <AlertDescription>
            Ваш аккаунт не привязан к университету. Обратитесь к администратору для настройки доступа.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Панель ВУЗа</h1>
          <p className="text-muted-foreground">{university.name_ru}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Информация
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Программы
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            Партнерства
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <UniversityEditor university={university} onUpdate={fetchUniversity} />
        </TabsContent>

        <TabsContent value="programs">
          <ProgramsEditor universityId={universityId} />
        </TabsContent>

        <TabsContent value="partnerships">
          <PartnershipsEditor universityId={universityId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
