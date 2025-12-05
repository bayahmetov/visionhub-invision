import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Users, GraduationCap, Building2, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const universityTypes = [
  { value: 'state', label: 'Государственные' },
  { value: 'private', label: 'Частные' },
  { value: 'national', label: 'Национальные' },
  { value: 'international', label: 'Международные' },
];

const regions = [
  'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Павлодар',
  'Семей', 'Атырау', 'Костанай', 'Тараз', 'Актау', 'Уральск',
  'Петропавловск', 'Кызылорда', 'Талдыкорган', 'Туркестан'
];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Map() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [hasGrants, setHasGrants] = useState(false);
  const [hasDormitory, setHasDormitory] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.0196, 66.9237]);

  const { data: universities, isLoading } = useQuery({
    queryKey: ['universities-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name_ru, city, region, type, students_count, latitude, longitude, has_grants, has_dormitory, logo_url')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      if (error) throw error;
      return data;
    },
  });

  const filteredUniversities = useMemo(() => {
    if (!universities) return [];
    return universities.filter(uni => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(uni.type)) return false;
      if (selectedRegion !== 'all' && uni.city !== selectedRegion) return false;
      if (hasGrants && !uni.has_grants) return false;
      if (hasDormitory && !uni.has_dormitory) return false;
      return true;
    });
  }, [universities, selectedTypes, selectedRegion, hasGrants, hasDormitory]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const createClusterIcon = (count: number) => {
    return new DivIcon({
      html: `<div class="cluster-marker">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: [40, 40],
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'national': return 'bg-amber-500';
      case 'state': return 'bg-primary';
      case 'private': return 'bg-purple-500';
      case 'international': return 'bg-emerald-500';
      default: return 'bg-muted';
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Тип ВУЗа</h4>
        <div className="space-y-2">
          {universityTypes.map(type => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => toggleType(type.value)}
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Город</h4>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Все города" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все города</SelectItem>
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={hasGrants} onCheckedChange={(c) => setHasGrants(!!c)} />
          <span className="text-sm">Есть гранты</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={hasDormitory} onCheckedChange={(c) => setHasDormitory(!!c)} />
          <span className="text-sm">Есть общежитие</span>
        </label>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Найдено: <span className="font-semibold text-foreground">{filteredUniversities.length}</span> ВУЗов
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        .custom-cluster-icon {
          background: transparent;
        }
        .cluster-marker {
          background: hsl(var(--primary));
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 250px;
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/30 border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Карта ВУЗов Казахстана</h1>
          <p className="text-muted-foreground">Найдите университет рядом с вами</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 border-r p-6 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </h3>
          <FilterContent />
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {/* Mobile Filter Button */}
          <div className="lg:hidden absolute top-4 left-4 z-[1000]">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm" className="shadow-lg">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры ({filteredUniversities.length})
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} />
              
              {filteredUniversities.map((uni) => (
                <Marker
                  key={uni.id}
                  position={[Number(uni.latitude), Number(uni.longitude)]}
                >
                  <Popup>
                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          {uni.logo_url && (
                            <img src={uni.logo_url} alt="" className="w-12 h-12 rounded-lg object-contain bg-muted" />
                          )}
                          <div>
                            <CardTitle className="text-base leading-tight">{uni.name_ru}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {uni.city}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className={`${getTypeColor(uni.type)} text-white`}>
                            {universityTypes.find(t => t.value === uni.type)?.label}
                          </Badge>
                          {uni.has_grants && <Badge variant="outline">Гранты</Badge>}
                        </div>
                        {uni.students_count && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Users className="h-4 w-4" />
                            {uni.students_count.toLocaleString()} студентов
                          </div>
                        )}
                        <Button asChild size="sm" className="w-full">
                          <Link to={`/universities/${uni.id}`}>Подробнее</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
