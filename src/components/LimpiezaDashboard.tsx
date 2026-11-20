import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LimpiezaDashboardProps {
  user: { email: string; nombre?: string };
  onLogout: () => void;
}

export default function LimpiezaDashboard({ user, onLogout }: LimpiezaDashboardProps) {
  const [habitacionesLimpieza, setHabitacionesLimpieza] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const mostrarNotificacion = (msg: string) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(null), 3500);
  };

  const cargarDatosLimpieza = async () => {
    // 1. Habitaciones que están en estado limpieza
    const { data: amb } = await supabase
      .from('ambientes')
      .select('id, codigo, nombre, tipo, estado')
      .eq('estado', 'limpieza')
      .order('codigo', { ascending: true });
    if (amb) setHabitacionesLimpieza(amb);

    // 2. Tareas de limpieza pendientes
    const { data: t } = await supabase
      .from('tareas_limpieza')
      .select('*')
      .eq('estado', 'pendiente')
      .order('creado_en', { ascending: false });
    if (t) setTareas(t);
  };

  useEffect(() => {
    cargarDatosLimpieza();

    // Sincronización en vivo
    const canal = supabase
      .channel('limpieza-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambientes' }, () => cargarDatosLimpieza())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas_limpieza' }, () => cargarDatosLimpieza())
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const handleMarcarLista = async (ambienteCodigo: string, tareaId?: string) => {
    try {
      // 1. Liberar habitación a disponible
      await supabase
        .from('ambientes')
        .update({ estado: 'disponible', huesped_actual: null })
        .eq('codigo', ambienteCodigo);

      // 2. Marcar tarea realizada
      if (tareaId) {
        await supabase
          .from('tareas_limpieza')
          .update({ estado: 'realizada' })
          .eq('id', tareaId);
      } else {
        await supabase
          .from('tareas_limpieza')
          .update({ estado: 'realizada' })
          .eq('ambiente_codigo', ambienteCodigo);
      }

      await cargarDatosLimpieza();
      mostrarNotificacion(`✓ Habitación ${ambienteCodigo} marcada como DISPONIBLE.`);
    } catch (e: any) {
      mostrarNotificacion('Error: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E140C] text-[#F5EBDC] font-['Instrument_Sans',sans-serif] flex flex-col justify-between">
      
      {/* NOTIFICACIÓN */}
      {notificacion && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-[#24170E] border border-[#E0A526] text-[#F5EBDC] text-xs font-semibold shadow-2xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E0A526] animate-pulse" />
          <span>{notificacion}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#24170E] border-b border-[#3D2817] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shadow-md border border-[#E0A526] overflow-hidden">
            <img src="/logo.png" alt="Hotel Asiri" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-['Young_Serif',serif] text-2xl text-[#F5EBDC] leading-none">
              Hotel <span className="text-[#E0A526]">ASIRI</span>
            </h1>
            <p className="text-xs text-[#6DB7D9] tracking-wide mt-1">Panel de Limpieza y Preparación</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#C9B096]">
            Personal: <strong className="text-white">{user.nombre || user.email}</strong>
          </span>
          <button
            onClick={onLogout}
            className="px-4 py-1.5 rounded-full bg-[#3D2817] hover:bg-[#5A3418] text-xs font-semibold text-[#F5EBDC] cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO DE LIMPIEZA */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Control de Limpieza</h2>
          <p className="text-sm text-[#C9B096] mt-1">
            Habitaciones desocupadas que requieren limpieza para pasar a Disponibles.
          </p>
        </div>

        {/* 1. HABITACIONES PENDIENTES DE LIMPIEZA */}
        <section className="space-y-4">
          <h3 className="font-['Young_Serif',serif] text-xl text-[#E0A526] border-b border-[#3D2817] pb-2">
            Habitaciones en Limpieza ({habitacionesLimpieza.length})
          </h3>

          {habitacionesLimpieza.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#24170E] border border-[#3D2817] text-center text-sm text-[#5FD08E]">
              ✓ No hay habitaciones pendientes de limpieza en este momento. ¡Todo listo!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {habitacionesLimpieza.map((hab) => (
                <div key={hab.id} className="p-5 rounded-2xl bg-[#24170E] border border-[#3D2817] flex flex-col justify-between space-y-4 shadow-xl">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-['Young_Serif',serif] text-xl text-[#F5EBDC]">{hab.codigo}</span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#2D6F8E]/20 text-[#6DB7D9] border border-[#2D6F8E] font-semibold">
                        En Limpieza
                      </span>
                    </div>
                    <p className="text-xs text-[#C9B096] mt-1">{hab.tipo}</p>
                  </div>

                  <button
                    onClick={() => handleMarcarLista(hab.codigo)}
                    className="w-full py-2.5 rounded-xl bg-[#2D6F8E] hover:bg-[#2F7D4F] text-white text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    ✓ Marcar como Lista
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. TAREAS ESPECÍFICAS ASIGNADAS */}
        <section className="space-y-4">
          <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] border-b border-[#3D2817] pb-2">
            Tareas Detalladas ({tareas.length})
          </h3>

          {tareas.length === 0 ? (
            <p className="text-xs text-[#C9B096]">No hay notas de limpieza específicas pendientes.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tareas.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-[#24170E] border border-[#3D2817] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#E0A526] text-sm">{t.ambiente_codigo}</span>
                    <p className="text-xs text-[#F5EBDC] mt-0.5">{t.tarea}</p>
                    <span className="text-[10px] text-[#C9B096]">Origen: {t.origen}</span>
                  </div>
                  <button
                    onClick={() => handleMarcarLista(t.ambiente_codigo, t.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#2F7D4F] hover:bg-[#5FD08E] hover:text-[#1E140C] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    ✓ Lista
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#120B06] border-t border-[#3D2817] py-3 text-center text-xs text-[#C9B096]">
        © 2026 Hotel Asiri · Sistema de Gestión Hotelera
      </footer>
    </div>
  );
}