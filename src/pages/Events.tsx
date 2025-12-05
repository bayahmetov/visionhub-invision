import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isFuture, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink, Video, Building2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const eventTypes = [
  { value: 'all', label: 'Все события', icon: Calendar },
  { value: 'open_day', label: 'Дни открытых дверей', icon: Building2 },
  { value: 'webinar', label: 'Вебинары', icon: Video },
  { value: 'deadline', label: 'Дедлайны', icon: Clock },
  { value: 'olympiad', label: 'Олимпиады', icon: Calendar },
];

const getEventTypeStyle = (type: string) => {
  switch (type) {
    case 'open_day': return 'bg-primary text-primary-foreground';
    case 'webinar': return 'bg-purple-500 text-white';
    case 'deadline': return 'bg-destructive text-destructive-foreground';
    case 'olympiad': return 'bg-amber-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function Events() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          universities (id, name_ru, logo_url, city)
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const cities = useMemo(() => {
    if (!events) return [];
    const uniqueCities = [...new Set(events.map(e => e.universities?.city).filter(Boolean))];
    return uniqueCities.sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      if (selectedType !== 'all' && event.event_type !== selectedType) return false;
      if (selectedCity !== 'all' && event.universities?.city !== selectedCity) return false;
      if (selectedDate && !isSameDay(parseISO(event.event_date), selectedDate)) return false;
      return true;
    });
  }, [events, selectedType, selectedCity, selectedDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventsInMonth = useMemo(() => {
    if (!events) return {};
    const map: Record<string, typeof events> = {};
    events.forEach(event => {
      const dateKey = format(parseISO(event.event_date), 'yyyy-MM-dd');
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    return map;
  }, [events]);

  const exportToICS = (event: any) => {
    const startDate = parseISO(event.event_date);
    const endDate = event.end_date ? parseISO(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}
SUMMARY:${event.title_ru}
DESCRIPTION:${event.description_ru || ''}
LOCATION:${event.location || (event.is_online ? 'Онлайн' : '')}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title_ru}.ics`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/30 border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Календарь событий</h1>
          <p className="text-muted-foreground">Дни открытых дверей, вебинары, дедлайны и олимпиады</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Тип события" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Город" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все города</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city!}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Календарь
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Список
            </Button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl">
                  {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* Padding for first week */}
                  {Array.from({ length: (monthDays[0].getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`pad-${i}`} className="h-24" />
                  ))}
                  
                  {monthDays.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsInMonth[dateKey] || [];
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(isSelected ? null : day)}
                        className={cn(
                          'h-24 p-1 rounded-lg border text-left transition-colors',
                          isToday(day) && 'border-primary',
                          isSelected && 'bg-primary/10 border-primary',
                          !isSelected && 'hover:bg-muted',
                          !isFuture(day) && !isToday(day) && 'opacity-50'
                        )}
                      >
                        <span className={cn(
                          'text-sm font-medium',
                          isToday(day) && 'text-primary'
                        )}>
                          {format(day, 'd')}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={cn(
                                'text-xs px-1 py-0.5 rounded truncate',
                                getEventTypeStyle(event.event_type)
                              )}
                            >
                              {event.title_ru}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} ещё
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="space-y-4">
              <h3 className="font-semibold">
                {selectedDate 
                  ? `События на ${format(selectedDate, 'd MMMM', { locale: ru })}`
                  : 'Ближайшие события'
                }
              </h3>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет событий
                </p>
              ) : (
                filteredEvents.slice(0, 5).map(event => (
                  <EventCard key={event.id} event={event} onExport={exportToICS} />
                ))
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Нет событий по выбранным фильтрам</p>
              </Card>
            ) : (
              filteredEvents.map(event => (
                <EventCard key={event.id} event={event} onExport={exportToICS} expanded />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onExport, expanded = false }: { event: any; onExport: (e: any) => void; expanded?: boolean }) {
  const eventDate = parseISO(event.event_date);

  return (
    <Card className="overflow-hidden">
      <CardContent className={cn('p-4', expanded && 'sm:flex gap-4')}>
        {expanded && (
          <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 bg-muted rounded-lg p-3">
            <span className="text-2xl font-bold text-primary">{format(eventDate, 'd')}</span>
            <span className="text-sm text-muted-foreground">{format(eventDate, 'MMM', { locale: ru })}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={getEventTypeStyle(event.event_type)}>
              {eventTypes.find(t => t.value === event.event_type)?.label}
            </Badge>
            {event.is_online && (
              <Badge variant="outline" className="gap-1">
                <Video className="h-3 w-3" />
                Онлайн
              </Badge>
            )}
          </div>
          
          <h4 className="font-semibold mb-1">{event.title_ru}</h4>
          
          {event.universities && (
            <Link 
              to={`/universities/${event.universities.id}`}
              className="text-sm text-primary hover:underline flex items-center gap-1 mb-2"
            >
              {event.universities.logo_url && (
                <img src={event.universities.logo_url} alt="" className="w-4 h-4 rounded" />
              )}
              {event.universities.name_ru}
            </Link>
          )}
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(eventDate, 'd MMM, HH:mm', { locale: ru })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            )}
          </div>
          
          {expanded && event.description_ru && (
            <p className="text-sm text-muted-foreground mb-3">{event.description_ru}</p>
          )}
          
          <div className="flex gap-2">
            {event.link && (
              <Button size="sm" variant="outline" asChild>
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Перейти
                </a>
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onExport(event)}>
              <Download className="h-4 w-4 mr-1" />
              В календарь
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
