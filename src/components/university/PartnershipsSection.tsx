import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Building2, Handshake, GraduationCap, Loader2 } from 'lucide-react';

interface PartnershipsSectionProps {
  universityId: string;
}

export function PartnershipsSection({ universityId }: PartnershipsSectionProps) {
  const { getLocalizedField } = useLanguage();

  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ['university-partnerships', universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .eq('university_id', universityId)
        .order('partner_name');
      if (error) throw error;
      return data;
    },
    enabled: !!universityId,
  });

  const partnershipTypeLabels: Record<string, string> = {
    exchange: 'Программа обмена',
    dual_degree: 'Двойной диплом',
    research: 'Научное сотрудничество',
    internship: 'Стажировки',
    other: 'Другое',
  };

  const partnershipTypeIcons: Record<string, React.ReactNode> = {
    exchange: <GraduationCap className="h-4 w-4" />,
    dual_degree: <Building2 className="h-4 w-4" />,
    research: <Globe className="h-4 w-4" />,
    internship: <Handshake className="h-4 w-4" />,
    other: <Globe className="h-4 w-4" />,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (partnerships.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">
          Информация о международных партнерствах пока не добавлена
        </p>
      </div>
    );
  }

  // Group by country
  const groupedByCountry = partnerships.reduce((acc, p) => {
    const country = p.partner_country;
    if (!acc[country]) acc[country] = [];
    acc[country].push(p);
    return acc;
  }, {} as Record<string, typeof partnerships>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe className="h-4 w-4" />
        <span>{partnerships.length} партнерств в {Object.keys(groupedByCountry).length} странах</span>
      </div>

      {Object.entries(groupedByCountry).map(([country, countryPartnerships]) => (
        <div key={country} className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg">{country}</span>
            <Badge variant="secondary" className="text-xs">
              {countryPartnerships.length}
            </Badge>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {countryPartnerships.map(partnership => (
              <Card key={partnership.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium">{partnership.partner_name}</h4>
                    {partnership.partnership_type && (
                      <Badge variant="outline" className="shrink-0 gap-1">
                        {partnershipTypeIcons[partnership.partnership_type]}
                        {partnershipTypeLabels[partnership.partnership_type] || partnership.partnership_type}
                      </Badge>
                    )}
                  </div>
                  {partnership.description_ru && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getLocalizedField(partnership, 'description')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
