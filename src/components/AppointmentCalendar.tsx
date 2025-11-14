import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, ChevronLeft, ChevronRight, Clock, CalendarCheck } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';

interface AppointmentCalendarProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

interface AvailabilityConfig {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ExistingAppointment {
  appointment_date: string;
  start_time: string;
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function AppointmentCalendar({ projectId, projectName, onClose }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityConfig[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<ExistingAppointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { showNotification, NotificationComponent } = useNotification();

  useEffect(() => {
    checkUser();
    loadAvailability();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadExistingAppointments();
      generateAvailableSlots();
    }
  }, [selectedDate, availability]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadAvailability = async () => {
    const { data } = await supabase
      .from('availability_config')
      .select('*')
      .eq('is_available', true);
    
    if (data) {
      setAvailability(data);
    }
  };

  const loadExistingAppointments = async () => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const { data } = await supabase
      .from('appointments')
      .select('appointment_date, start_time')
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled');

    if (data) {
      setExistingAppointments(data);
    }
  };

  const generateAvailableSlots = () => {
    if (!selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    const config = availability.find(a => a.day_of_week === dayOfWeek);

    if (!config || !config.is_available) {
      setAvailableSlots([]);
      return;
    }

    const slots: string[] = [];
    const [startHour, startMin] = config.start_time.split(':').map(Number);
    const [endHour, endMin] = config.end_time.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      
      // Verificar si ya existe una cita en este horario
      const isBooked = existingAppointments.some(apt => apt.start_time === timeStr + ':00');
      
      // Verificar si ya pasó la hora (solo para hoy)
      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();
      const isPast = isToday && (currentHour < now.getHours() || (currentHour === now.getHours() && currentMin <= now.getMinutes()));

      if (!isBooked && !isPast) {
        slots.push(timeStr);
      }

      // Incrementar 1 hora
      currentMin += 60;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    setAvailableSlots(slots);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;

    const dayOfWeek = date.getDay();
    const config = availability.find(a => a.day_of_week === dayOfWeek);
    
    return config?.is_available || false;
  };

  const handleBookAppointment = async () => {
    if (!user) {
      showNotification('Debes iniciar sesión para agendar un turno', 'warning');
      return;
    }

    if (!selectedDate || !selectedTime) {
      showNotification('Selecciona una fecha y hora', 'warning');
      return;
    }

    setLoading(true);

    const dateStr = selectedDate.toISOString().split('T')[0];
    const startTime = selectedTime + ':00';
    
    // Calcular hora de fin (1 hora después)
    const [hour, min] = selectedTime.split(':').map(Number);
    const endHour = hour + 1;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;

    const { error } = await supabase
      .from('appointments')
      .insert([{
        user_id: user.id,
        project_id: projectId,
        appointment_date: dateStr,
        start_time: startTime,
        end_time: endTime,
        status: 'scheduled',
      }]);

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        showNotification('Este horario ya fue reservado. Por favor selecciona otro.', 'error');
      } else {
        showNotification('Error al agendar el turno: ' + error.message, 'error');
      }
      return;
    }

    showNotification('¡Turno agendado exitosamente!', 'success');
    onClose();
  };

  const days = getDaysInMonth();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-white p-2 transition-colors hover:bg-neutral-100"
        >
          <X className="h-6 w-6 text-neutral-900" strokeWidth={1.5} />
        </button>

        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-light tracking-wide text-neutral-900">
            Agendar Turno
          </h2>
          <p className="font-light text-neutral-600">
            {projectName}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Calendario */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="p-2 transition-colors hover:bg-neutral-100"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <h3 className="text-lg font-light tracking-wide">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 transition-colors hover:bg-neutral-100"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-light text-neutral-500">
                  {day}
                </div>
              ))}
              {days.map((date, index) => {
                const isAvailable = isDateAvailable(date);
                const isSelected = date && selectedDate && 
                  date.toDateString() === selectedDate.toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (date && isAvailable) {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }
                    }}
                    disabled={!date || !isAvailable}
                    className={`aspect-square p-2 text-sm font-light transition-all ${
                      !date
                        ? 'cursor-default'
                        : isSelected
                        ? 'bg-neutral-900 text-white'
                        : isAvailable
                        ? 'border border-neutral-300 hover:border-neutral-900'
                        : 'cursor-not-allowed text-neutral-300'
                    }`}
                  >
                    {date?.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horarios disponibles */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-light tracking-wide">
              <Clock className="h-5 w-5" strokeWidth={1.5} />
              Horarios Disponibles
            </h3>

            {!selectedDate ? (
              <div className="flex h-64 items-center justify-center text-sm font-light text-neutral-500">
                Selecciona una fecha
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm font-light text-neutral-500">
                No hay horarios disponibles
              </div>
            ) : (
              <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`border p-3 text-sm font-light transition-all ${
                      selectedTime === slot
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="mt-6 space-y-4">
                <div className="border border-neutral-200 bg-neutral-50 p-4">
                  <p className="mb-2 text-sm font-light text-neutral-900">
                    <strong>Fecha:</strong> {selectedDate.toLocaleDateString('es-AR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm font-light text-neutral-900">
                    <strong>Hora:</strong> {selectedTime} - {parseInt(selectedTime.split(':')[0]) + 1}:{selectedTime.split(':')[1]}
                  </p>
                </div>

                <button
                  onClick={handleBookAppointment}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 border border-green-500 bg-green-500 px-6 py-3 text-sm tracking-wider text-white transition-all hover:bg-green-600 disabled:opacity-50"
                >
                  <CalendarCheck className="h-5 w-5" strokeWidth={1.5} />
                  {loading ? 'AGENDANDO...' : 'CONFIRMAR TURNO'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-light text-blue-900">
            <strong>Importante:</strong> Los turnos tienen una duración de 1 hora. Recibirás un email de confirmación.
          </p>
        </div>
      </div>
      {NotificationComponent}
    </div>
  );
}
