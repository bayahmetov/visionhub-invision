import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, BookOpen, Users, Handshake, Star, User, KeyRound, LogOut, Tag } from 'lucide-react';
import UniversitiesManager from './admin/UniversitiesManager';
import ProgramsManager from './admin/ProgramsManager';
import UsersManager from './admin/UsersManager';
import PartnershipsManager from './admin/PartnershipsManager';
import ReviewsManager from './admin/ReviewsManager';
import AccessRequestsManager from './admin/AccessRequestsManager';
import FieldsManager from './admin/FieldsManager';
import ProfileTab from './shared/ProfileTab';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

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
        <TabsList className="grid w-full grid-cols-8 mb-8">
          <TabsTrigger value="universities" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">ВУЗы</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Программы</span>
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Направления</span>
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            <span className="hidden sm:inline">Партнерства</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Пользователи</span>
          </TabsTrigger>
          <TabsTrigger value="access-requests" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">Заявки</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Отзывы</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Профиль</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
          <UniversitiesManager />
        </TabsContent>
        <TabsContent value="programs">
          <ProgramsManager />
        </TabsContent>
        <TabsContent value="fields">
          <FieldsManager />
        </TabsContent>
        <TabsContent value="partnerships">
          <PartnershipsManager />
        </TabsContent>
        <TabsContent value="users">
          <UsersManager />
        </TabsContent>
        <TabsContent value="access-requests">
          <AccessRequestsManager />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewsManager />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}