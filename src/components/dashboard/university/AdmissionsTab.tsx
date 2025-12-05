import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Loader2, Award, DollarSign, Clock, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdmissionsTabProps {
  universityId: string;
  university: any;
}

export default function AdmissionsTab({ universityId, university }: AdmissionsTabProps) {
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['university_programs_admissions', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*, fields_of_study:field_id(name_ru)')
        .eq('university_id', universityId)
        .order('degree_level')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const degreeLabels: Record<string, string> = {
    bachelor: 'Бакалавриат',
    master: 'Магистратура',
    doctorate: 'Докторантура',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Group programs by degree level
  const programsByDegree = programs.reduce((acc: Record<string, any[]>, program) => {
    const level = program.degree_level || 'other';
    if (!acc[level]) acc[level] = [];
    acc[level].push(program);
    return acc;
  }, {});

  // Calculate stats
  const stats = {
    totalPrograms: programs.length,
    withGrants: programs.filter(p => p.grants_available).length,
    minEntScore: Math.min(...programs.map(p => p.ent_min_score || Infinity).filter(s => s !== Infinity)) || null,
    avgTuition: programs.filter(p => p.tuition_fee_kzt).length > 0
      ? Math.round(programs.reduce((sum, p) => sum + (p.tuition_fee_kzt || 0), 0) / programs.filter(p => p.tuition_fee_kzt).length)
      : null,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Программ</p>
                <p className="text-2xl font-bold">{stats.totalPrograms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">С грантами</p>
                <p className="text-2xl font-bold">{stats.withGrants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary/50">
                <Users className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Мин. балл ЕНТ</p>
                <p className="text-2xl font-bold">{stats.minEntScore || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Средняя стоимость</p>
                <p className="text-lg font-bold">{stats.avgTuition ? formatCurrency(stats.avgTuition) : '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Контакты приемной комиссии</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Телефон</p>
              <p className="font-medium">{university.phone || 'Не указан'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{university.email || 'Не указан'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Адрес</p>
              <p className="font-medium">{university.address || 'Не указан'}</p>
            </div>
          </div>
          {university.website && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Сайт</p>
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {university.website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programs by Degree */}
      {Object.entries(programsByDegree).map(([degree, degreePrograms]) => (
        <Card key={degree}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {degreeLabels[degree] || degree}
              <Badge variant="secondary" className="ml-2">{degreePrograms.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Программа</TableHead>
                    <TableHead>Направление</TableHead>
                    <TableHead className="text-center">Мин. балл ЕНТ</TableHead>
                    <TableHead className="text-center">Срок обучения</TableHead>
                    <TableHead className="text-right">Стоимость</TableHead>
                    <TableHead className="text-center">Грант</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {degreePrograms.map((program: any) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name_ru}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {program.fields_of_study?.name_ru || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {program.ent_min_score ? (
                          <Badge variant={program.ent_min_score >= 100 ? 'destructive' : 'secondary'}>
                            {program.ent_min_score}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {program.duration_years} {program.duration_years === 1 ? 'год' : program.duration_years < 5 ? 'года' : 'лет'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(program.tuition_fee_kzt)}
                      </TableCell>
                      <TableCell className="text-center">
                        {program.grants_available ? (
                          <Badge variant="default" className="bg-green-500">Да</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {programs.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              Нет добавленных программ. Добавьте программы во вкладке "Программы".
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}