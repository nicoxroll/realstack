import { Calendar, Check, CheckCircle, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotification } from "../../hooks/useNotification";
import { supabase } from "../../lib/supabase";

interface AvailabilityConfig {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Appointment {
  id: string;
  user_id: string;
  project_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  user_email?: string;
  project_name?: string;
}

interface AppointmentsManagerProps {
  onUpdate: () => void;
}

const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function AppointmentsManager({
  onUpdate,
}: AppointmentsManagerProps) {
  const [availability, setAvailability] = useState<AvailabilityConfig[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification, NotificationComponent } = useNotification();
  const [activeTab, setActiveTab] = useState<"availability" | "appointments">(
    "availability"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadAvailability(), loadAppointments()]);
    setLoading(false);
  };

  const loadAvailability = async () => {
    const { data, error } = await supabase
      .from("availability_config")
      .select("*")
      .order("day_of_week", { ascending: true });

    if (error) {
      console.error("Error loading availability:", error);
      return;
    }

    setAvailability(data || []);
  };

  const loadAppointments = async () => {
    // Obtener turnos
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .gte("appointment_date", new Date().toISOString().split("T")[0])
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (appointmentsError) {
      console.error("Error loading appointments:", appointmentsError);
      return;
    }

    // Obtener información de usuarios desde user_visits (evita usar admin.listUsers)
    const { data: userVisitsData } = await supabase
      .from("user_visits")
      .select("user_id, user_email")
      .not("user_email", "is", null);

    // Crear mapa de user_id -> email
    const userEmailMap = new Map();
    userVisitsData?.forEach((visit) => {
      if (visit.user_email && !userEmailMap.has(visit.user_id)) {
        userEmailMap.set(visit.user_id, visit.user_email);
      }
    });

    // Obtener información de proyectos
    const { data: projectsData } = await supabase
      .from("projects")
      .select("id, name");

    // Combinar información
    const enrichedAppointments = (appointmentsData || []).map((apt) => {
      const userEmail = userEmailMap.get(apt.user_id);
      const project = projectsData?.find((p) => p.id === apt.project_id);
      return {
        ...apt,
        user_email: userEmail || "Usuario desconocido",
        project_name: project?.name,
      };
    });

    setAppointments(enrichedAppointments);
  };

  const handleUpdateAvailability = async (
    dayOfWeek: number,
    field: string,
    value: any
  ) => {
    const config = availability.find((a) => a.day_of_week === dayOfWeek);
    if (!config) return;

    // Usar función RPC o actualización directa
    const { error } = await supabase
      .rpc("update_availability_config", {
        p_day_of_week: dayOfWeek,
        p_field: field,
        p_value: value.toString(),
      })
      .single();

    if (error) {
      // Si no existe la función RPC, intentar actualización directa (requiere permisos especiales)
      console.error("Error updating availability:", error);
      showNotification(
        "Error al actualizar disponibilidad. Verifica los permisos.",
        "error"
      );
      return;
    }

    showNotification("Disponibilidad actualizada correctamente", "success");
    loadAvailability();
    onUpdate();
  };

  const handleUpdateAppointmentStatus = async (
    appointmentId: string,
    newStatus: string
  ) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointmentId);

    if (error) {
      showNotification(
        "Error al actualizar el turno: " + error.message,
        "error"
      );
      return;
    }

    showNotification("Estado del turno actualizado correctamente", "success");
    loadAppointments();
    onUpdate();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg font-light text-neutral-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-light tracking-wide text-neutral-900">
          Gestión de Turnos
        </h2>
      </div>
      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("availability")}
          className={`pb-3 text-sm font-light tracking-wider transition-all ${
            activeTab === "availability"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Clock className="mb-1 inline h-4 w-4" strokeWidth={1.5} />{" "}
          DISPONIBILIDAD
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-3 text-sm font-light tracking-wider transition-all ${
            activeTab === "appointments"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Calendar className="mb-1 inline h-4 w-4" strokeWidth={1.5} /> TURNOS
          AGENDADOS
        </button>
      </div>
      {/* Contenido de Disponibilidad */}
      {activeTab === "availability" && (
        <div>
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-light text-blue-900">
              💡 Configura los horarios disponibles para agendar turnos. Los
              turnos tienen una duración de 1 hora.
            </p>
          </div>

          <div className="-mx-4 md:-mx-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden mx-4 md:mx-0">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                        Día
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                        Inicio
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                        Fin
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light text-neutral-600">
                        Disponible
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {availability.map((config) => (
                      <tr key={config.id}>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                          <div className="max-w-[70px] md:max-w-none truncate">
                            {dayNames[config.day_of_week]}
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                          <input
                            type="time"
                            value={config.start_time}
                            onChange={(e) =>
                              handleUpdateAvailability(
                                config.day_of_week,
                                "start_time",
                                e.target.value
                              )
                            }
                            className="border border-neutral-300 px-1 md:px-2 py-1 text-xs font-light outline-none transition-all focus:border-neutral-900 w-full max-w-[80px] md:max-w-[110px]"
                            disabled={!config.is_available}
                          />
                        </td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                          <input
                            type="time"
                            value={config.end_time}
                            onChange={(e) =>
                              handleUpdateAvailability(
                                config.day_of_week,
                                "end_time",
                                e.target.value
                              )
                            }
                            className="border border-neutral-300 px-1 md:px-2 py-1 text-xs font-light outline-none transition-all focus:border-neutral-900 w-full max-w-[80px] md:max-w-[110px]"
                            disabled={!config.is_available}
                          />
                        </td>
                        <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                          <button
                            onClick={() =>
                              handleUpdateAvailability(
                                config.day_of_week,
                                "is_available",
                                !config.is_available
                              )
                            }
                            className={`px-2 md:px-3 py-1 text-xs transition-all ${
                              config.is_available
                                ? "border border-green-500 text-green-600 hover:bg-green-50"
                                : "border border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                            }`}
                          >
                            {config.is_available ? "SÍ" : "NO"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      {/* Contenido de Turnos Agendados */}
      {activeTab === "appointments" && (
        <div>
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-light text-blue-900">
              📅 Turnos agendados por los usuarios. Puedes confirmar, cancelar o
              marcar como completados.
            </p>
          </div>

          <div className="-mx-4 md:-mx-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                {appointments.length === 0 ? (
                  <div className="border border-neutral-200 bg-white rounded-lg mx-4 md:mx-0 px-6 py-12 text-center font-light text-neutral-500">
                    No hay turnos agendados
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden mx-4 md:mx-0">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light tracking-wider text-neutral-600">
                          Fecha
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-light tracking-wider text-neutral-600">
                          Horario
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-light tracking-wider text-neutral-600">
                          Usuario
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-sm font-light tracking-wider text-neutral-600">
                          Proyecto
                        </th>
                        <th className="px-3 md:px-6 py-3 text-center text-xs md:text-sm font-light tracking-wider text-neutral-600">
                          Estado
                        </th>
                        <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-light tracking-wider text-neutral-600">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                            {new Date(
                              appointment.appointment_date
                            ).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                            {appointment.start_time.slice(0, 5)}
                          </td>
                          <td className="hidden md:table-cell px-6 py-3 text-sm font-light">
                            <div className="truncate max-w-[150px]">
                              {appointment.user_email || "N/A"}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-6 py-3 text-sm font-light">
                            <div className="truncate max-w-[150px]">
                              {appointment.project_name || "N/A"}
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-3 text-xs md:text-sm font-light">
                            {appointment.status === "scheduled" && "Agendado"}
                            {appointment.status === "confirmed" && "Confirmado"}
                            {appointment.status === "cancelled" && "Cancelado"}
                            {appointment.status === "completed" && "Completado"}
                          </td>
                          <td className="px-3 md:px-6 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              {appointment.status === "scheduled" && (
                                <button
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(
                                      appointment.id,
                                      "confirmed"
                                    )
                                  }
                                  className="border border-green-500 p-1.5 md:p-2 text-green-600 transition-all hover:bg-green-50"
                                  title="Confirmar"
                                >
                                  <Check
                                    className="h-3.5 w-3.5 md:h-4 md:w-4"
                                    strokeWidth={1.5}
                                  />
                                </button>
                              )}
                              {(appointment.status === "scheduled" ||
                                appointment.status === "confirmed") && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleUpdateAppointmentStatus(
                                        appointment.id,
                                        "completed"
                                      )
                                    }
                                    className="border border-blue-500 p-1.5 md:p-2 text-blue-600 transition-all hover:bg-blue-50"
                                    title="Marcar como completado"
                                  >
                                    <CheckCircle
                                      className="h-3.5 w-3.5 md:h-4 md:w-4"
                                      strokeWidth={1.5}
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateAppointmentStatus(
                                        appointment.id,
                                        "cancelled"
                                      )
                                    }
                                    className="border border-red-500 p-1.5 md:p-2 text-red-600 transition-all hover:bg-red-50"
                                    title="Cancelar"
                                  >
                                    <X
                                      className="h-3.5 w-3.5 md:h-4 md:w-4"
                                      strokeWidth={1.5}
                                    />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {NotificationComponent}
    </div>
  );
}
