import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, BookOpen, Users, Handshake, Star } from 'lucide-react';
import UniversitiesManager from './admin/UniversitiesManager';
import ProgramsManager from './admin/ProgramsManager';
import UsersManager from './admin/UsersManager';
import PartnershipsManager from './admin/PartnershipsManager';
import ReviewsManager from './admin/ReviewsManager';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('universities');
  const { signOut, user } = useAuth();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Панель администратора</h1>
          <p className="text-muted-foreground">Полное управление данными системы</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="universities" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">ВУЗы</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Программы</span>
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            <span className="hidden sm:inline">Партнерства</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Пользователи</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Отзывы</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
          <UniversitiesManager />
        </TabsContent>
        <TabsContent value="programs">
          <ProgramsManager />
        </TabsContent>
        <TabsContent value="partnerships">
          <PartnershipsManager />
        </TabsContent>
        <TabsContent value="users">
          <UsersManager />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
