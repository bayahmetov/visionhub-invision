import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, Users, Building2, Bus, Shield, Home, Wallet, 
  Search, GraduationCap, Star 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cities() {
  const [search, setSearch] = useState('');

  const { data: cities, isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name_ru');
      if (error) throw error;
      return data;
    },
  });

  const { data: universityCounts } = useQuery({
    queryKey: ['university-counts-by-city'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('city');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(uni => {
        counts[uni.city] = (counts[uni.city] || 0) + 1;
      });
      return counts;
    },
  });

  const filteredCities = cities?.filter(city => 
    city.name_ru.toLowerCase().includes(search.toLowerCase()) ||
    city.region.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const formatPrice = (price: number | null) => {
    if (!price) return '—';
    return `${(price / 1000).toFixed(0)}K ₸`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/30 border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Гид по городам</h1>
          <p className="text-muted-foreground">
            Узнайте о студенческой жизни в разных городах Казахстана
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск города..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredCities.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {cities?.length === 0 
                ? 'Данные о городах пока не добавлены'
                : 'Город не найден'
              }
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map(city => (
              <Card key={city.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {city.image_url ? (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={city.image_url} 
                      alt={city.name_ru}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                    <MapPin className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{city.name_ru}</CardTitle>
                      <p className="text-sm text-muted-foreground">{city.region}</p>
                    </div>
                    {city.safety_rating && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {city.safety_rating}/5
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {city.population && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{(city.population / 1000000).toFixed(1)}M жителей</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{universityCounts?.[city.name_ru] || 0} ВУЗов</span>
                    </div>
                  </div>

                  {city.description_ru && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {city.description_ru}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <Wallet className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Жизнь/мес</p>
                      <p className="text-sm font-semibold">{formatPrice(city.cost_of_living_kzt)}</p>
                    </div>
                    <div className="text-center">
                      <Home className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Общежитие</p>
                      <p className="text-sm font-semibold">{formatPrice(city.dormitory_cost_kzt)}</p>
                    </div>
                    <div className="text-center">
                      <Building2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Аренда</p>
                      <p className="text-sm font-semibold">{formatPrice(city.rent_cost_kzt)}</p>
                    </div>
                  </div>

                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/universities?city=${city.name_ru}`}>
                      Смотреть ВУЗы в {city.name_ru}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
