import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Heart, AlertTriangle, CheckCircle } from "lucide-react";
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';
import { generateTimeSlots, isSlotAvailable, isWorkingDay } from '@/utils/scheduleUtils';

interface CalendarEvent {
  id: number;
  type: 'appointment' | 'vaccination' | 'antiparasitic';
  title: string;
  time?: string;
  status: string;
  clientName?: string;
  petName?: string;
  date: string;
  color?: string;
}

interface UnifiedCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
  showTimeSlots?: boolean;
  title?: string;
  icon?: React.ReactNode;
}

const getEventColor = (type: string, status: string) => {
  switch (type) {
    case 'appointment':
      switch (status) {
        case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
        case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    case 'vaccination':
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
        case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      }
    case 'antiparasitic':
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
        case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-purple-100 text-purple-800 border-purple-200';
      }
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEventIcon = (type: string, status: string) => {
  switch (type) {
    case 'appointment':
      return <Clock className="h-3 w-3" />;
    case 'vaccination':
      return <CheckCircle className="h-3 w-3" />;
    case 'antiparasitic':
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
};

export const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  events,
  onEventClick,
  onDateClick,
  onTimeSlotClick,
  showTimeSlots = false,
  title = "Calendrier",
  icon = <Calendar className="h-5 w-5" />
}) => {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Générer les jours du mois
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  while (current <= monthEnd || days.length < 42) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Grouper les événements par date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = event.date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Générer les créneaux pour la date sélectionnée
  const timeSlots = useMemo(() => {
    if (!selectedDate || !showTimeSlots) return [];
    return generateTimeSlots(selectedDate, settings.scheduleSettings, []);
  }, [selectedDate, showTimeSlots, settings.scheduleSettings]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    onDateClick?.(dateStr);
  };

  const handleTimeSlotClick = (time: string) => {
    if (onTimeSlotClick && selectedDate) {
      onTimeSlotClick(selectedDate, time);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {icon}
              {title}
            </CardTitle>
            <div className="flex items-center justify-between sm:gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="flex-1 sm:flex-none">
                ←
              </Button>
              <span className="font-medium text-sm sm:text-base px-2 sm:min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="flex-1 sm:flex-none">
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="grid grid-cols-7 gap-1 mb-2 sm:mb-4">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dayKey] || [];
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());
              const isSelected = dayKey === selectedDate;
              const isWorking = isWorkingDay(dayKey, settings.scheduleSettings);
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[60px] sm:min-h-[80px] p-1 border rounded-lg relative cursor-pointer hover:bg-muted/50
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                    ${!isWorking ? 'opacity-50' : ''}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={`text-xs sm:text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1">
                    {dayEvents.slice(0, 2).map((event, eIndex) => (
                      <div
                        key={eIndex}
                        className={`
                          text-xs p-0.5 sm:p-1 rounded text-center truncate border cursor-pointer
                          ${getEventColor(event.type, event.status)}
                        `}
                        title={`${event.title}${event.time ? ` - ${event.time}` : ''}${event.clientName ? ` (${event.clientName})` : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1 justify-center">
                          {getEventIcon(event.type, event.status)}
                          <span className="truncate text-xs">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Détails du jour sélectionné */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {eventsByDate[selectedDate]?.length > 0 ? (
              <div className="space-y-3">
                {eventsByDate[selectedDate].map((event) => (
                  <div
                    key={event.id}
                    className={`
                      p-3 rounded-lg border cursor-pointer hover:shadow-sm
                      ${getEventColor(event.type, event.status)}
                    `}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type, event.status)}
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.status}
                      </Badge>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.clientName && (
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <User className="h-3 w-3" />
                        <span>{event.clientName}</span>
                      </div>
                    )}
                    {event.petName && (
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <Heart className="h-3 w-3" />
                        <span>{event.petName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Aucun événement prévu pour cette date
              </p>
            )}

            {/* Créneaux horaires disponibles */}
            {showTimeSlots && timeSlots.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Créneaux disponibles</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={slot.isAvailable ? "outline" : "ghost"}
                      size="sm"
                      disabled={!slot.isAvailable}
                      onClick={() => handleTimeSlotClick(slot.time)}
                      className="text-xs p-1 sm:p-2"
                    >
                      {slot.time}
                      {slot.isLunchBreak && (
                        <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline">Pause</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
