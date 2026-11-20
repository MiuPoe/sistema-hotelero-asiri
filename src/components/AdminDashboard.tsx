import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  user: {
    email: string;
    rol: string;
    nombre?: string;
  };
  onLogout: () => void;
}

// -------------------------------------------------------------
// ICONOS VECTORIALES SVG PUROS
// -------------------------------------------------------------

function LogoAsiriIsotipo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-md border border-[#E0A526] overflow-hidden`}>
      <img src="/logo.png" alt="Hotel Asiri" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none' }} />
    </div>
  );
}

function IconPanel({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconKey({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-1.5 1.5L14 9l-1.5-1.5-2 2 1.5 1.5L9 14" />
      <circle cx="7.5" cy="16.5" r="5.5" />
      <path d="m15.5 4.5 4 4" />
    </svg>
  );
}

function IconAmbientes({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
    </svg>
  );
}

function IconReservas({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function IconHuespedes({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
    </svg>
  );
}

function IconCheckInOut({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconCaja({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function IconLimpieza({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 21 8.5-8.5" />
      <path d="M12.5 11 17 6.5a2.12 2.12 0 0 1 3 3L15.5 14" />
      <path d="m10 14 4 4" />
      <path d="M14 18l-6 3-3-3 3-6" />
    </svg>
  );
}

function IconAtencion({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// -------------------------------------------------------------
// MODELOS
// -------------------------------------------------------------

interface PersonalUsuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'administrador' | 'recepcionista' | 'limpieza';
  activo: boolean;
  ultimoAcceso: string;
}

interface Ambiente {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  tarifa_base: number;
  estado: 'disponible' | 'ocupada' | 'pendiente' | 'pagada' | 'limpieza';
  huespedActual?: string;
  codigoEstadia?: string;
}

interface Huesped {
  id: string;
  codigo: string;
  nombre: string;
  documento: string;
  contacto: string;
  estadiasTotal: number;
  montoAcumulado: number;
  codigoEstadiaActiva?: string;
  fotocopiaRecibida: boolean;
  fotocopiaUrl?: string;
}

interface Estadia {
  id: string;
  codigoEstadia: string;
  huespedNombre: string;
  documento: string;
  contacto: string;
  ambienteCodigo: string;
  fechaEntrada: string;
  fechaSalida: string;
  personas: number;
  saldoPendiente: number;
  estado: 'confirmada' | 'en_curso' | 'finalizada';
  fotocopiaRecibida: boolean;
  fotocopiaUrl?: string;
  motivoFueraHorario?: string;
}

interface Reserva {
  id: string;
  codigo?: string;
  ambienteId?: string;
  ambienteCodigo: string;
  huespedId?: string;
  huespedNombre: string;
  documento?: string;
  contacto?: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: 'pendiente' | 'confirmada' | 'en_curso' | 'finalizada';
  estadoPago: 'pendiente' | 'confirmada';
  montoTotal: number;
}

interface TareaLimpieza {
  id: string;
  ambienteCodigo: string;
  tarea: string;
  responsable: string;
  origen: 'checkout' | 'manual';
  estado: 'pendiente' | 'realizada';
}

interface MovimientoCaja {
  id: string;
  tipo: 'ingreso' | 'egreso';
  fecha: string;
  categoria: string;
  detalle: string;
  monto: number;
  metodo: 'Efectivo' | 'Pago QR (Presencial)' | 'Tarjeta' | 'Transferencia';
  comprobanteUrl?: string;
  estadiaVinculada?: string;
}

interface SolicitudReserva {
  id: string;
  clienteId?: string;
  nombre: string;
  telefono: string;
  email?: string;
  ambienteCodigo: string;
  fechaEntrada: string;
  fechaSalida: string;
  personas: number;
  estado: 'pendiente' | 'confirmada' | 'rechazada';
  createdAt: string;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const esAdmin = user.rol === 'administrador';

  const [seccionActiva, setSeccionActiva] = useState<
    'panel' | 'ambientes' | 'reservas' | 'huespedes' | 'checkin_out' | 'caja' | 'limpieza' | 'usuarios' | 'atencion'
  >('panel');

  const [tabPanel, setTabPanel] = useState<'modulos' | 'resumen'>('modulos');
  const [vistaReservas, setVistaReservas] = useState<'calendario' | 'lista' | 'solicitudes'>('calendario');

  // Notificación flotante
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const mostrarNotificacion = (msg: string) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(null), 4000);
  };

  // Datos dinámicos de Supabase
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudReserva[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [estadias, setEstadias] = useState<Estadia[]>([]);
  const [tareasLimpieza, setTareasLimpieza] = useState<TareaLimpieza[]>([]);
  const [cajaMovimientos, setCajaMovimientos] = useState<MovimientoCaja[]>([]);
  const [personal, setPersonal] = useState<PersonalUsuario[]>([]);
  const [guardandoReserva, setGuardandoReserva] = useState(false);

  // Filtros y Métricas Rápidas
  const [filtroAmbienteEstado, setFiltroAmbienteEstado] = useState<string>('todos');
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;

  // Modales
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [, setShowCheckInModal] = useState<Estadia | null>(null);
  const [, setShowCheckOutWarning] = useState<Estadia | null>(null);
  const [showNuevaTareaModal, setShowNuevaTareaModal] = useState(false);
  const [showNuevoIngresoModal, setShowNuevoIngresoModal] = useState(false);
  const [showNuevoEgresoModal, setShowNuevoEgresoModal] = useState(false);
  const [showCierreCajaModal, setShowCierreCajaModal] = useState(false);
  const [showNuevaReservaModal, setShowNuevaReservaModal] = useState(false);

  // Form Ingreso (Fiel a la Imagen 2)
  const [nuevoMovFecha, setNuevoMovFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nuevoMovCategoria, setNuevoMovCategoria] = useState('Hospedaje');
  const [nuevoMovReservaVinculada, setNuevoMovReservaVinculada] = useState('');
  const [nuevoMovDetalle, setNuevoMovDetalle] = useState('');
  const [nuevoMovMonto, setNuevoMovMonto] = useState('');
  const [nuevoMovMetodo, setNuevoMovMetodo] = useState<'Efectivo' | 'Pago QR (Presencial)' | 'Tarjeta' | 'Transferencia'>('Pago QR (Presencial)');
  const [nuevoMovComprobante, setNuevoMovComprobante] = useState('');

  // Form Reserva
  const [reservaAmbiente, setReservaAmbiente] = useState('Habitación 101');
  const [reservaAmbienteId, setReservaAmbienteId] = useState('');
  const [reservaHuesped, setReservaHuesped] = useState('');
  const [reservaDoc, setReservaDoc] = useState('');
  const [reservaTel, setReservaTel] = useState('');
  const [reservaEntrada, setReservaEntrada] = useState(new Date().toISOString().split('T')[0]);
  const [reservaSalida, setReservaSalida] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [reservaEstadoPago, setReservaEstadoPago] = useState<'pendiente' | 'confirmada'>('pendiente');

  // Form Personal
  const [nuevoUserNombre, setNuevoUserNombre] = useState('');
  const [nuevoUserEmail, setNuevoUserEmail] = useState('');
  const [nuevoUserPass, setNuevoUserPass] = useState('');
  const [nuevoUserRol, setNuevoUserRol] = useState<'administrador' | 'recepcionista' | 'limpieza'>('recepcionista');

  // Form Limpieza
  const [nuevaTareaAmbiente, setNuevaTareaAmbiente] = useState('HAB-101');
  const [nuevaTareaDesc, setNuevaTareaDesc] = useState('');
  const [nuevaTareaResponsable, setNuevaTareaResponsable] = useState('Grimanez Cordero');

  // Calendario tipo Excel (Imagen 3)
  const [offsetDias, setOffsetDias] = useState(0);
  const [celdaInicio, setCeldaInicio] = useState<{ room: string; fecha: string } | null>(null);

  // Generador de ventana de 14 días
  const hoyBase = new Date();
  hoyBase.setDate(hoyBase.getDate() + offsetDias);

  const diasVentana = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(hoyBase);
    d.setDate(d.getDate() + i);
    const diasLetra = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const fechaISO = d.toISOString().split('T')[0];
    return {
      num: String(d.getDate()).padStart(2, '0'),
      dia: diasLetra[d.getDay()],
      fecha: fechaISO,
      mesNombre: d.toLocaleDateString('es-ES', { month: 'short' }),
      esHoy: fechaISO === new Date().toISOString().split('T')[0]
    };
  });

  const mesVisible = diasVentana[0].mesNombre.toUpperCase() + ' ' + diasVentana[0].fecha.split('-')[0];

  // -------------------------------------------------------------
  // CARGA COMPLETA EN TIEMPO REAL DESDE SUPABASE
  // -------------------------------------------------------------
  const cargarDatos = async () => {
    try {
      // 1. Ambientes
      const { data: ambData } = await supabase
        .from('ambientes')
        .select('*')
        .order('codigo', { ascending: true });

      if (ambData && ambData.length > 0) {
        setAmbientes(ambData.map(a => ({
          id: String(a.id),
          codigo: a.codigo || a.numero || `HAB-${a.id}`,
          nombre: a.nombre || `${a.codigo || a.numero} ${a.tipo || ''}`,
          tipo: a.tipo || 'Simple',
          capacidad: Number(a.capacidad) || 2,
          tarifa_base: Number(a.tarifa_base || a.precio) || 300,
          estado: (a.estado === 'en_limpieza' ? 'limpieza' : a.estado) || 'disponible',
          huespedActual: a.huesped_actual || a.huespedActual,
          codigoEstadia: a.codigo_estadia || a.codigoEstadia
        })));
      }

      // 2. Huéspedes
      const { data: hData } = await supabase
        .from('huespedes')
        .select('*');

      if (hData) {
        setHuespedes(hData.map(h => ({
          id: String(h.id),
          codigo: h.codigo || `HU-${String(h.id).padStart(4, '0')}`,
          nombre: h.nombre || h.nombres || h.nombre_completo || '',
          documento: h.documento || h.documento_identidad || '',
          contacto: h.contacto || h.telefono || '',
          estadiasTotal: Number(h.estadias_total) || 1,
          montoAcumulado: Number(h.monto_acumulado) || 0,
          codigoEstadiaActiva: h.codigo_estadia_activa,
          fotocopiaRecibida: Boolean(h.fotocopia_recibida),
          fotocopiaUrl: h.fotocopia_url
        })));
      }

      // 3. Reservas
      const { data: resData } = await supabase
        .from('reservas')
        .select('*');

      if (resData) {
        setReservas(resData.map(r => {
          const ambRel = ambData?.find((a: any) => a.id === r.ambiente_id || a.codigo === r.ambiente_codigo);
          const huespRel = hData?.find((h: any) => h.id === r.huesped_id);

          return {
            id: String(r.id),
            codigo: r.codigo || `RES-${String(r.id).slice(0, 5)}`,
            ambienteId: r.ambiente_id || ambRel?.id,
            ambienteCodigo: r.ambiente_codigo || ambRel?.nombre || ambRel?.codigo || '',
            huespedId: r.huesped_id || huespRel?.id,
            huespedNombre: r.huesped_nombre || huespRel?.nombre || huespRel?.nombres || 'Huésped',
            documento: r.documento || huespRel?.documento || '',
            contacto: r.contacto || huespRel?.contacto || huespRel?.telefono || '',
            fechaEntrada: r.fecha_entrada || '',
            fechaSalida: r.fecha_salida || '',
            estado: r.estado || 'pendiente',
            estadoPago: r.estado_pago || (r.estado === 'confirmada' ? 'confirmada' : 'pendiente'),
            montoTotal: Number(r.total || r.monto_total) || 300
          };
        }));
      }

      // 4. Estadías
      const { data: estData } = await supabase
        .from('estadias')
        .select('*');

      if (estData) {
        setEstadias(estData.map(e => ({
          id: String(e.id),
          codigoEstadia: e.codigo_estadia || e.codigoEstadia || `AS-${e.id}`,
          huespedNombre: e.huesped_nombre || e.huespedNombre || '',
          documento: e.documento || '',
          contacto: e.contacto || '',
          ambienteCodigo: e.ambiente_codigo || e.ambienteCodigo || '',
          fechaEntrada: e.fecha_entrada || e.fecha_checkin || '',
          fechaSalida: e.fecha_salida || e.fecha_checkout || '',
          personas: Number(e.personas) || 1,
          saldoPendiente: Number(e.saldo_pendiente) || 0,
          estado: e.estado || 'en_curso',
          fotocopiaRecibida: Boolean(e.fotocopia_recibida),
          fotocopiaUrl: e.fotocopia_url,
          motivoFueraHorario: e.motivo_fuera_horario
        })));
      }

      // 5. Tareas Limpieza
      const { data: limpData } = await supabase
        .from('tareas_limpieza')
        .select('*')
        .order('id', { ascending: false });

      if (limpData) {
        setTareasLimpieza(limpData.map(t => ({
          id: String(t.id),
          ambienteCodigo: t.ambiente_codigo || t.ambienteCodigo || '',
          tarea: t.tarea || t.descripcion || '',
          responsable: t.responsable || 'Grimanez Cordero',
          origen: t.origen || 'manual',
          estado: t.estado === 'completada' ? 'realizada' : (t.estado || 'pendiente')
        })));
      }

      // 6. Movimientos Caja
      const { data: movData } = await supabase
        .from('movimientos_caja')
        .select('*')
        .order('fecha', { ascending: false });

      if (movData) {
        setCajaMovimientos(movData.map(m => ({
          id: String(m.id),
          tipo: m.tipo || 'ingreso',
          fecha: m.fecha ? m.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
          categoria: m.categoria || 'Hospedaje',
          detalle: m.detalle || m.concepto || '',
          monto: Number(m.monto) || 0,
          metodo: m.metodo || 'Pago QR (Presencial)',
          comprobanteUrl: m.comprobante_url,
          estadiaVinculada: m.estadia_vinculada
        })));
      }

      // 7. Personal (Perfiles)
      const { data: perfData } = await supabase
        .from('perfiles')
        .select('*');

      if (perfData && perfData.length > 0) {
        setPersonal(perfData.map(p => ({
          id: String(p.id),
          nombre: p.nombre || p.nombre_completo || '',
          email: p.email || '',
          rol: p.rol || 'recepcionista',
          activo: p.activo !== false,
          ultimoAcceso: p.ultimo_acceso || 'Hoy'
        })));
      } else {
        setPersonal([
          { id: 'u1', nombre: 'Tamara Franco Betancur', email: 'tamfranco63@gmail.com', rol: 'administrador', activo: true, ultimoAcceso: 'Hoy 22:30' },
          { id: 'u2', nombre: 'Leonel Armin Mayta Tarqui', email: 'leonel17mayta@gmail.com', rol: 'recepcionista', activo: true, ultimoAcceso: 'Hoy 18:30' },
          { id: 'u3', nombre: 'Grimanez Cordero Villasante', email: 'grimsvillasante@gmail.com', rol: 'limpieza', activo: true, ultimoAcceso: 'Hoy 15:45' }
        ]);
      }
      // 8. Solicitudes de Reserva Web
      const { data: solData } = await supabase
        .from('solicitudes_reserva')
        .select('*')
        .order('created_at', { ascending: false });

      if (solData) {
        setSolicitudes(solData.map((s: any) => ({
          id: String(s.id),
          clienteId: s.cliente_id,
          nombre: s.nombre || 'Cliente Web',
          telefono: s.telefono || 'Sin teléfono',
          email: s.email || '',
          ambienteCodigo: s.ambiente_codigo || '',
          fechaEntrada: s.fecha_entrada || '',
          fechaSalida: s.fecha_salida || '',
          personas: Number(s.personas) || 1,
          estado: s.estado || 'pendiente',
          createdAt: s.created_at || ''
        })));
      }
    } catch (err) {
      console.error('Error cargando datos de Supabase:', err);
    }
  };

  // Suscripción Realtime
  useEffect(() => {
    cargarDatos();

    const canal = supabase
      .channel('hotel-asiri-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambientes' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'huespedes' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos_caja' }, () => {
        cargarDatos();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitudes_reserva' }, (payload: any) => {
        mostrarNotificacion(`🔔 ¡Nueva solicitud de reserva de ${payload.new?.nombre || 'un cliente'}!`);
        cargarDatos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes_reserva' }, () => {
        cargarDatos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // Función de auto-limpieza al cambiar fechas
  const verificarYLimpiarPorFecha = (nuevaEntrada: string, nuevaSalida: string) => {
    setReservaEntrada(nuevaEntrada);
    setReservaSalida(nuevaSalida);

    const amb = ambientes.find(a => 
      (reservaAmbienteId && a.id === reservaAmbienteId) ||
      a.nombre === reservaAmbiente || 
      a.codigo === reservaAmbiente || 
      reservaAmbiente.includes(a.codigo)
    );

    const existente = reservas.find(r => 
      (r.ambienteId === amb?.id || r.ambienteCodigo === amb?.codigo || r.ambienteCodigo === amb?.nombre || r.ambienteCodigo === reservaAmbiente) &&
      r.fechaEntrada === nuevaEntrada && r.fechaSalida === nuevaSalida
    );

    if (existente) {
      setReservaHuesped(existente.huespedNombre);
      setReservaDoc(existente.documento || '');
      setReservaTel(existente.contacto || '');
      setReservaEstadoPago(existente.estadoPago as any || 'pendiente');
    } else {
      // Limpia automáticamente los campos para llenar fácilmente la nueva reserva
      setReservaHuesped('');
      setReservaDoc('');
      setReservaTel('');
    }
  };

  // Totales
  const conteoLibres = ambientes.filter(a => a.estado === 'disponible').length;
  const conteoOcupadas = ambientes.filter(a => a.estado === 'ocupada').length;
  const conteoPendientes = ambientes.filter(a => a.estado === 'pendiente').length;
  const conteoPagadas = ambientes.filter(a => a.estado === 'pagada').length;
  const conteoLimpieza = ambientes.filter(a => a.estado === 'limpieza').length;

  const totalIngresos = cajaMovimientos.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto, 0);
  const totalEgresos = cajaMovimientos.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + m.monto, 0);
  const saldoCaja = totalIngresos - totalEgresos;

  const ambientesFiltrados = ambientes.filter(a => {
    return filtroAmbienteEstado === 'todos' || a.estado === filtroAmbienteEstado;
  });

   const handleGuardarReserva = async () => {
    // Evitar clics múltiples mientras está procesando
    if (guardandoReserva) return;

    if (!reservaHuesped || (!reservaAmbiente && !reservaAmbienteId)) {
      mostrarNotificacion('Completa el nombre del huésped y el ambiente.');
      return;
    }

    if (reservaEntrada > reservaSalida) {
      mostrarNotificacion('La fecha de entrada no puede ser mayor a la fecha de salida.');
      return;
    }

    // 1. Encontrar el ambiente
    const amb = ambientes.find(a => 
      (reservaAmbienteId && a.id === reservaAmbienteId) ||
      a.codigo === reservaAmbiente || 
      a.nombre === reservaAmbiente || 
      (a.nombre && reservaAmbiente.includes(a.nombre)) ||
      (a.codigo && reservaAmbiente.includes(a.codigo))
    ) || ambientes[0];

    const ambId = amb?.id;
    const ambCod = amb?.nombre || amb?.codigo || reservaAmbiente;

    // 2. VALIDACIÓN DE SOBRE-REGISTRO: ¿Ya está ocupada en ese rango?
    const existeSolapamiento = reservas.find(r => {
      const mismoAmbiente = r.ambienteId === ambId || 
                            r.ambienteCodigo === amb?.codigo || 
                            r.ambienteCodigo === amb?.nombre || 
                            r.ambienteCodigo === reservaAmbiente;
      if (!mismoAmbiente) return false;

      // Se solapa si: EntradaNueva <= SalidaExistente Y SalidaNueva >= EntradaExistente
      return reservaEntrada <= r.fechaSalida && reservaSalida >= r.fechaEntrada;
    });

    if (existeSolapamiento) {
      mostrarNotificacion(`⚠️ Ya existe una reserva para ${existeSolapamiento.huespedNombre} (${existeSolapamiento.fechaEntrada} al ${existeSolapamiento.fechaSalida}). No se puede sobre-registrar.`);
      return;
    }

    // Bloquear el botón para evitar duplicados por clics múltiples
    setGuardandoReserva(true);

    try {
      const hoyStr = new Date().toISOString().split('T')[0];
      const esFechaActual = reservaEntrada <= hoyStr && reservaSalida >= hoyStr;
      const estadoCalculado = esFechaActual ? 'en_curso' : reservaEstadoPago;

      // 3. Obtener o crear el huésped en Supabase
      let huespedId: string | null = null;
      try {
        const { data: hExist } = await supabase
          .from('huespedes')
          .select('id')
          .or(`nombre.eq.${reservaHuesped},nombres.eq.${reservaHuesped}`)
          .maybeSingle();

        if (hExist?.id) {
          huespedId = hExist.id;
        } else {
          const intentos = [
            { nombre: reservaHuesped, documento: reservaDoc || null, telefono: reservaTel || null },
            { nombres: reservaHuesped, documento: reservaDoc || null, telefono: reservaTel || null },
            { nombre_completo: reservaHuesped, documento_identidad: reservaDoc || null, contacto: reservaTel || null }
          ];

          for (const item of intentos) {
            const { data: hNuevo } = await supabase
              .from('huespedes')
              .insert(item as any)
              .select('id')
              .maybeSingle();
            if (hNuevo?.id) {
              huespedId = hNuevo.id;
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Sync huésped:', e);
      }

      if (!huespedId && huespedes.length > 0) {
        huespedId = huespedes[0].id;
      }

      // 4. Obtener profile_id
      let profileId: string | null = null;
      const miPerfil = personal.find(p => p.email.toLowerCase() === user.email.toLowerCase());
      if (miPerfil?.id && miPerfil.id.includes('-') && miPerfil.id.length > 30) {
        profileId = miPerfil.id;
      } else {
        try {
          const { data: perfDb } = await supabase.from('perfiles').select('id').maybeSingle();
          if (perfDb?.id) profileId = perfDb.id;
        } catch (e) {}
      }

      // 5. Inserción única en reservas
      const codigoReserva = `RES-${amb?.codigo || '105'}-${Date.now().toString().slice(-4)}`;
      
      const payloadBase: any = {
        codigo: codigoReserva,
        fecha_entrada: reservaEntrada,
        fecha_salida: reservaSalida,
        cantidad_huespedes: 1
      };

      if (ambId) payloadBase.ambiente_id = ambId;
      if (huespedId) payloadBase.huesped_id = huespedId;
      if (profileId) payloadBase.profile_id = profileId;

      const payloadExtendido: any = {
        ...payloadBase,
        ambiente_codigo: ambCod,
        huesped_nombre: reservaHuesped,
        documento: reservaDoc,
        contacto: reservaTel,
        estado: estadoCalculado,
        estado_pago: reservaEstadoPago,
        total: 300
      };

      let resFinalId: string = `res-${Date.now()}`;

      const { data: dExt, error: errExt } = await supabase.from('reservas').insert(payloadExtendido).select('id').maybeSingle();
      if (!errExt && dExt) {
        resFinalId = dExt.id;
      } else {
        const { data: dBase, error: errBase } = await supabase.from('reservas').insert(payloadBase).select('id').maybeSingle();
        if (!errBase && dBase) {
          resFinalId = dBase.id;
        } else {
          delete payloadBase.profile_id;
          const { data: dBase2 } = await supabase.from('reservas').insert(payloadBase).select('id').maybeSingle();
          if (dBase2) resFinalId = dBase2.id;
        }
      }

      // 6. Actualizar estado local
      const nuevaRes: Reserva = {
        id: resFinalId,
        codigo: codigoReserva,
        ambienteId: ambId,
        ambienteCodigo: ambCod,
        huespedId: huespedId || undefined,
        huespedNombre: reservaHuesped,
        documento: reservaDoc,
        contacto: reservaTel,
        fechaEntrada: reservaEntrada,
        fechaSalida: reservaSalida,
        estado: estadoCalculado,
        estadoPago: reservaEstadoPago,
        montoTotal: 300
      };

      setReservas(prev => [nuevaRes, ...prev.filter(r => r.id !== nuevaRes.id)]);

      // 7. Actualizar ambiente
      const nuevoEstadoAmb = esFechaActual ? 'ocupada' : (reservaEstadoPago === 'confirmada' ? 'pagada' : 'pendiente');
      setAmbientes(prev => prev.map(a => a.id === ambId || a.codigo === amb?.codigo ? { ...a, estado: nuevoEstadoAmb, huespedActual: reservaHuesped } : a));

      if (ambId) {
        await supabase.from('ambientes').update({
          estado: nuevoEstadoAmb,
          huesped_actual: reservaHuesped
        }).eq('id', ambId);
      }

      // 8. Desplazar calendario al día de la reserva
      try {
        const fechaResDate = new Date(reservaEntrada + 'T00:00:00');
        const fechaHoyDate = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');
        const diffDias = Math.round((fechaResDate.getTime() - fechaHoyDate.getTime()) / (1000 * 60 * 60 * 24));
        setOffsetDias(diffDias >= 0 ? diffDias : 0);
      } catch (e) {}

      await cargarDatos();

      setShowNuevaReservaModal(false);
      setCeldaInicio(null);
      mostrarNotificacion(`✓ Reserva para ${reservaHuesped} guardada exitosamente.`);
    } catch (err: any) {
      mostrarNotificacion('Error al guardar: ' + (err.message || 'Error'));
    } finally {
      setGuardandoReserva(false);
    }
  };

  const handleAprobarSolicitud = async (sol: SolicitudReserva) => {
    try {
      // 1. Buscar ambiente adecuado
      const amb = ambientes.find(a => 
        a.codigo === sol.ambienteCodigo || 
        a.nombre === sol.ambienteCodigo || 
        (a.nombre && sol.ambienteCodigo.includes(a.nombre)) ||
        (a.codigo && sol.ambienteCodigo.includes(a.codigo)) ||
        (a.tipo && sol.ambienteCodigo.toLowerCase().includes(a.tipo.toLowerCase()))
      ) || ambientes[0];

      const ambId = amb?.id;

      // 2. Obtener o crear huésped
      let huespedId: string | null = null;
      try {
        const { data: hExist } = await supabase
          .from('huespedes')
          .select('id')
          .or(`nombre.eq.${sol.nombre},nombres.eq.${sol.nombre}`)
          .maybeSingle();

        if (hExist?.id) {
          huespedId = hExist.id;
        } else {
          const { data: hNuevo } = await supabase
            .from('huespedes')
            .insert({
              nombre: sol.nombre,
              contacto: sol.telefono,
              email: sol.email || null
            } as any)
            .select('id')
            .maybeSingle();
          if (hNuevo?.id) huespedId = hNuevo.id;
        }
      } catch (e) {}

      // 3. Crear la reserva confirmada en la tabla reservas
      const codigoRes = `RES-${amb?.codigo || '101'}-${Date.now().toString().slice(-4)}`;
      const payloadBase: any = {
        codigo: codigoRes,
        fecha_entrada: sol.fechaEntrada,
        fecha_salida: sol.fechaSalida,
        cantidad_huespedes: sol.personas || 1
      };
      if (ambId) payloadBase.ambiente_id = ambId;
      if (huespedId) payloadBase.huesped_id = huespedId;

      await supabase.from('reservas').insert(payloadBase);

      // 4. Actualizar estado de la solicitud a 'confirmada'
      await supabase
        .from('solicitudes_reserva')
        .update({ estado: 'confirmada' })
        .eq('id', sol.id);

      // 5. Actualizar ambiente a 'reservado'
      if (ambId) {
        await supabase.from('ambientes').update({
          estado: 'reservado',
          huesped_actual: sol.nombre
        }).eq('id', ambId);
      }

      await cargarDatos();
      mostrarNotificacion(`✓ Solicitud de ${sol.nombre} aprobada y registrada en el hotel.`);
    } catch (err: any) {
      mostrarNotificacion('Error al aprobar: ' + (err.message || 'Error'));
    }
  };

  const handleRechazarSolicitud = async (solicitudId: string) => {
    try {
      await supabase
        .from('solicitudes_reserva')
        .update({ estado: 'rechazada' })
        .eq('id', solicitudId);

      setSolicitudes(prev => prev.map(s => s.id === solicitudId ? { ...s, estado: 'rechazada' } : s));
      mostrarNotificacion('Solicitud marcada como rechazada.');
    } catch (err: any) {
      mostrarNotificacion('Error al rechazar: ' + (err.message || 'Error'));
    }
  };

  const handleGuardarIngreso = async () => {
    if (!nuevoMovMonto || !nuevoMovDetalle) {
      mostrarNotificacion('Por favor completa el detalle y el monto.');
      return;
    }

    const montoNum = parseFloat(nuevoMovMonto);
    const nuevoIng: MovimientoCaja = {
      id: `c-${Date.now()}`,
      tipo: 'ingreso',
      fecha: nuevoMovFecha,
      categoria: nuevoMovCategoria,
      detalle: nuevoMovDetalle,
      monto: montoNum,
      metodo: nuevoMovMetodo,
      comprobanteUrl: nuevoMovComprobante || undefined,
      estadiaVinculada: nuevoMovReservaVinculada || undefined
    };

    setCajaMovimientos(prev => [nuevoIng, ...prev]);

    if (nuevoMovReservaVinculada) {
      setReservas(prev => prev.map(r => r.id === nuevoMovReservaVinculada ? { ...r, estadoPago: 'confirmada', estado: 'confirmada' } : r));
    }

    setShowNuevoIngresoModal(false);
    setNuevoMovDetalle('');
    setNuevoMovMonto('');
    setNuevoMovComprobante('');
    mostrarNotificacion('Ingreso registrado en caja.');

    try {
      await supabase.from('movimientos_caja').insert({
        tipo: 'ingreso',
        fecha: nuevoMovFecha,
        categoria: nuevoMovCategoria,
        detalle: nuevoMovDetalle,
        monto: montoNum,
        metodo: nuevoMovMetodo,
        comprobante_url: nuevoMovComprobante || null,
        estadia_vinculada: nuevoMovReservaVinculada || null
      });

      if (nuevoMovReservaVinculada) {
        await supabase.from('reservas').update({ estado: 'confirmada', estado_pago: 'confirmada' }).eq('id', nuevoMovReservaVinculada);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuardarPersonal = async () => {
    if (!nuevoUserNombre || !nuevoUserEmail) {
      mostrarNotificacion('Por favor ingresa nombre y correo.');
      return;
    }

    const nuevo: PersonalUsuario = {
      id: `u-${Date.now()}`,
      nombre: nuevoUserNombre,
      email: nuevoUserEmail,
      rol: nuevoUserRol,
      activo: true,
      ultimoAcceso: 'Hoy'
    };

    setPersonal(prev => [nuevo, ...prev]);
    setShowAddUserModal(false);
    setNuevoUserNombre('');
    setNuevoUserEmail('');
    setNuevoUserPass('');
    mostrarNotificacion(`Usuario ${nuevoUserNombre} añadido.`);

    try {
      await supabase.from('perfiles').insert({
        nombre: nuevoUserNombre,
        email: nuevoUserEmail,
        rol: nuevoUserRol,
        activo: true,
        ultimo_acceso: 'Hoy'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLiberarHabitacion = async (codigo: string) => {
    setAmbientes(prev => prev.map(a => a.codigo === codigo ? { ...a, estado: 'disponible', huespedActual: undefined } : a));
    setTareasLimpieza(prev => prev.filter(t => t.ambienteCodigo !== codigo));
    mostrarNotificacion(`Habitación ${codigo} marcada como DISPONIBLE.`);

    try {
      await supabase.from('ambientes').update({ estado: 'disponible', huesped_actual: null }).eq('codigo', codigo);
      await supabase.from('tareas_limpieza').update({ estado: 'realizada' }).eq('ambiente_codigo', codigo);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAsignarLimpieza = async (codigo: string) => {
    setAmbientes(prev => prev.map(a => a.codigo === codigo ? { ...a, estado: 'limpieza' } : a));
    const nuevaTarea: TareaLimpieza = {
      id: `t-${Date.now()}`,
      ambienteCodigo: codigo,
      tarea: 'Limpieza y preparación de habitación',
      responsable: 'Grimanez Cordero',
      origen: 'manual',
      estado: 'pendiente'
    };
    setTareasLimpieza(prev => [nuevaTarea, ...prev]);
    mostrarNotificacion(`Habitación ${codigo} asignada a Limpieza.`);

    try {
      await supabase.from('ambientes').update({ estado: 'limpieza' }).eq('codigo', codigo);
      await supabase.from('tareas_limpieza').insert({
        ambiente_codigo: codigo,
        tarea: 'Limpieza y preparación de habitación',
        responsable: 'Grimanez Cordero',
        origen: 'manual',
        estado: 'pendiente'
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Click en Celda tipo Excel
  const handleCeldaClick = (roomNombre: string, fechaStr: string) => {
    if (!celdaInicio || celdaInicio.room !== roomNombre) {
      setCeldaInicio({ room: roomNombre, fecha: fechaStr });
      mostrarNotificacion(`Inicio selección: ${roomNombre} el ${fechaStr}. Haz click en la fecha fin.`);
    } else {
      const fecha1 = celdaInicio.fecha < fechaStr ? celdaInicio.fecha : fechaStr;
      const fecha2 = celdaInicio.fecha < fechaStr ? fechaStr : celdaInicio.fecha;
      setReservaAmbiente(roomNombre);
      const amb = ambientes.find(a => a.nombre === roomNombre || a.codigo === roomNombre);
      if (amb) setReservaAmbienteId(amb.id);
      verificarYLimpiarPorFecha(fecha1, fecha2);
      setShowNuevaReservaModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E140C] text-[#F5EBDC] font-['Instrument_Sans',sans-serif] flex flex-col justify-between selection:bg-[#E0A526]/30">
      
      {/* NOTIFICACIÓN FLOTANTE */}
      {notificacion && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-[#24170E] border border-[#E0A526] text-[#F5EBDC] text-xs font-semibold shadow-2xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E0A526] animate-pulse" />
          <span>{notificacion}</span>
        </div>
      )}

      {/* HEADER SUPERIOR CON LOGO EN FONDO BLANCO */}
      <header className="bg-[#24170E] border-b border-[#3D2817] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3.5">
          <LogoAsiriIsotipo className="w-10 h-10" />
          <div>
            <h1 className="font-['Young_Serif',serif] text-2xl text-[#F5EBDC] leading-none">
              Hotel <span className="text-[#E0A526]">ASIRI</span>
            </h1>
            <p className="text-xs text-[#C9B096] tracking-wide mt-1">Sistema de Gestión Hotelera · Tarija, Bolivia</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#2D1E12] border border-[#5A3418]">
            <div className="w-7 h-7 rounded-full bg-[#E0A526] text-[#1E140C] font-bold text-sm flex items-center justify-center">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-[#F5EBDC]">
              {user.nombre || user.email.split('@')[0]} · <span className="text-[#E0A526] uppercase">{user.rol}</span>
            </span>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-1.5 rounded-full bg-[#3D2817] hover:bg-[#5A3418] text-xs font-semibold text-[#F5EBDC] transition-all cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#24170E] border-r border-[#3D2817] p-4 flex flex-col justify-between">
          <nav className="space-y-1.5">
            <button
              onClick={() => setSeccionActiva('panel')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'panel' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <IconPanel className="w-5 h-5 text-[#E0A526]" />
              <span>Panel</span>
            </button>

            {esAdmin && (
              <button
                onClick={() => setSeccionActiva('usuarios')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  seccionActiva === 'usuarios' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
                }`}
              >
                <IconKey className="w-5 h-5 text-[#E0A526]" />
                <span>Usuarios</span>
              </button>
            )}

            <button
              onClick={() => setSeccionActiva('ambientes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'ambientes' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <IconAmbientes className="w-5 h-5 text-[#E0A526]" />
              <span>Ambientes</span>
            </button>

            <button
              onClick={() => setSeccionActiva('reservas')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'reservas' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconReservas className="w-5 h-5 text-[#E0A526]" />
                <span>Reservas</span>
              </div>
              {solicitudesPendientes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0A526] text-[#1E140C] shadow animate-pulse">
                  {solicitudesPendientes} nueva{solicitudesPendientes > 1 ? 's' : ''}
                </span>
              )}
            </button>

            <button
              onClick={() => setSeccionActiva('huespedes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'huespedes' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <IconHuespedes className="w-5 h-5 text-[#E0A526]" />
              <span>Huéspedes</span>
            </button>

            <button
              onClick={() => setSeccionActiva('checkin_out')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'checkin_out' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <IconCheckInOut className="w-5 h-5 text-[#E0A526]" />
              <span>Check-in / Check-out</span>
            </button>

            <button
              onClick={() => setSeccionActiva('caja')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'caja' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <IconCaja className="w-5 h-5 text-[#E0A526]" />
              <span>Caja y pagos</span>
            </button>

            <button
              onClick={() => setSeccionActiva('limpieza')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'limpieza' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <IconLimpieza className="w-5 h-5 text-[#E0A526]" />
              <span>Limpieza</span>
            </button>

            <button
              onClick={() => setSeccionActiva('atencion')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                seccionActiva === 'atencion' ? 'bg-[#3D2817] text-[#E0A526] shadow' : 'text-[#C9B096] hover:bg-[#2D1E12] hover:text-[#F5EBDC]'
              }`}
            >
              <IconAtencion className="w-5 h-5 text-[#E0A526]" />
              <span>Atención al cliente</span>
            </button>
          </nav>

          <div className="p-3.5 rounded-xl bg-[#1E140C] border border-[#3D2817] text-xs text-[#C9B096] leading-relaxed">
            <p className="font-bold text-[#F5EBDC] mb-1">Horarios PMS</p>
            <p>Recepción: 8:30 a 18:00</p>
            <p>Check-in: 8:30 a 12:00</p>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">

          {/* VISTA 1: PANEL */}
          {seccionActiva === 'panel' && (
            <div className="space-y-7">
              <div>
                <h2 className="font-['Young_Serif',serif] text-3xl sm:text-4xl text-[#F5EBDC]">
                  Panel {esAdmin ? 'de Administrador' : 'de Recepción'}
                </h2>
                <p className="text-sm text-[#C9B096] mt-1">
                  {tabPanel === 'modulos' ? 'Selecciona un módulo para gestionar el hotel:' : 'Estado general del hotel hoy.'}
                </p>
              </div>

              <div className="flex items-center gap-8 border-b border-[#3D2817] text-sm font-semibold">
                <button
                  onClick={() => setTabPanel('modulos')}
                  className={`pb-3 transition-all relative cursor-pointer ${tabPanel === 'modulos' ? 'text-[#E0A526]' : 'text-[#C9B096] hover:text-[#F5EBDC]'}`}
                >
                  Módulos
                  {tabPanel === 'modulos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E0A526]" />}
                </button>
                <button
                  onClick={() => setTabPanel('resumen')}
                  className={`pb-3 transition-all relative cursor-pointer ${tabPanel === 'resumen' ? 'text-[#E0A526]' : 'text-[#C9B096] hover:text-[#F5EBDC]'}`}
                >
                  Resumen
                  {tabPanel === 'resumen' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E0A526]" />}
                </button>
              </div>

              {tabPanel === 'modulos' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div onClick={() => setSeccionActiva('ambientes')} className="rounded-2xl p-6 bg-gradient-to-b from-[#8A5326]/80 to-[#5A3418]/70 border border-[#5A3418] hover:border-[#E0A526] cursor-pointer transition-all hover:scale-[1.02] shadow-xl group">
                    <IconAmbientes className="w-8 h-8 text-[#F5EBDC] mb-4" />
                    <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] mb-1.5">Ambientes</h3>
                    <p className="text-sm text-[#F5EBDC]/80">23 ambientes, estado en vivo y asignación rápida a limpieza.</p>
                    <span className="text-sm text-[#F28C38] font-bold group-hover:translate-x-1 transition-transform inline-block mt-4">Ver ambientes →</span>
                  </div>

                  <div onClick={() => setSeccionActiva('reservas')} className="rounded-2xl p-6 bg-gradient-to-b from-[#8A5326]/80 to-[#5A3418]/70 border border-[#5A3418] hover:border-[#E0A526] cursor-pointer transition-all hover:scale-[1.02] shadow-xl group">
                    <IconReservas className="w-8 h-8 text-[#F5EBDC] mb-4" />
                    <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] mb-1.5">Reservas</h3>
                    <p className="text-sm text-[#F5EBDC]/80">Calendario interactivo, vista lista y solicitudes online.</p>
                    <span className="text-sm text-[#F28C38] font-bold group-hover:translate-x-1 transition-transform inline-block mt-4">Gestionar reservas →</span>
                  </div>

                  <div onClick={() => setSeccionActiva('checkin_out')} className="rounded-2xl p-6 bg-gradient-to-b from-[#8A5326]/80 to-[#5A3418]/70 border border-[#5A3418] hover:border-[#E0A526] cursor-pointer transition-all hover:scale-[1.02] shadow-xl group">
                    <IconCheckInOut className="w-8 h-8 text-[#F5EBDC] mb-4" />
                    <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] mb-1.5">Check-in / Check-out</h3>
                    <p className="text-sm text-[#F5EBDC]/80">Control de horario (8:30 a 12:00), fotocopias y salidas.</p>
                    <span className="text-sm text-[#F28C38] font-bold group-hover:translate-x-1 transition-transform inline-block mt-4">Gestionar accesos →</span>
                  </div>

                  <div onClick={() => setSeccionActiva('caja')} className="rounded-2xl p-6 bg-gradient-to-b from-[#8A5326]/80 to-[#5A3418]/70 border border-[#5A3418] hover:border-[#E0A526] cursor-pointer transition-all hover:scale-[1.02] shadow-xl group">
                    <IconCaja className="w-8 h-8 text-[#F5EBDC] mb-4" />
                    <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] mb-1.5">Caja y pagos</h3>
                    <p className="text-sm text-[#F5EBDC]/80">Ingresos con comprobantes, egresos y cierre de turno.</p>
                    <span className="text-sm text-[#F28C38] font-bold group-hover:translate-x-1 transition-transform inline-block mt-4">Abrir caja →</span>
                  </div>

                  <div onClick={() => setSeccionActiva('limpieza')} className="rounded-2xl p-6 bg-gradient-to-b from-[#8A5326]/80 to-[#5A3418]/70 border border-[#5A3418] hover:border-[#E0A526] cursor-pointer transition-all hover:scale-[1.02] shadow-xl group">
                    <IconLimpieza className="w-8 h-8 text-[#F5EBDC] mb-4" />
                    <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] mb-1.5">Limpieza</h3>
                    <p className="text-sm text-[#F5EBDC]/80">Supervisión de cuartos y liberación a disponible.</p>
                    <span className="text-sm text-[#F28C38] font-bold group-hover:translate-x-1 transition-transform inline-block mt-4">Ver tareas →</span>
                  </div>

                  <div onClick={() => setSeccionActiva('huespedes')} className="rounded-2xl p-6 bg-gradient-to-b from-[#8A5326]/80 to-[#5A3418]/70 border border-[#5A3418] hover:border-[#E0A526] cursor-pointer transition-all hover:scale-[1.02] shadow-xl group">
                    <IconHuespedes className="w-8 h-8 text-[#F5EBDC] mb-4" />
                    <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] mb-1.5">Huéspedes</h3>
                    <p className="text-sm text-[#F5EBDC]/80">Perfiles HU-xxxx, control de fotocopia de carnet e historial.</p>
                    <span className="text-sm text-[#F28C38] font-bold group-hover:translate-x-1 transition-transform inline-block mt-4">Ver directorio →</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-6 rounded-2xl bg-[#24170E] border border-[#3D2817] shadow-xl">
                    <span className="font-['Young_Serif',serif] text-4xl text-[#5FD08E]">{conteoLibres}</span>
                    <p className="text-sm text-[#C9B096] mt-2 font-medium">Habitaciones libres</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#24170E] border border-[#3D2817] shadow-xl">
                    <span className="font-['Young_Serif',serif] text-4xl text-[#F28C38]">{conteoOcupadas}</span>
                    <p className="text-sm text-[#C9B096] mt-2 font-medium">Habitaciones en uso</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#24170E] border border-[#3D2817] shadow-xl">
                    <span className="font-['Young_Serif',serif] text-4xl text-[#6DB7D9]">{conteoLimpieza}</span>
                    <p className="text-sm text-[#C9B096] mt-2 font-medium">En limpieza</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#24170E] border border-[#3D2817] shadow-xl">
                    <span className="font-['Young_Serif',serif] text-4xl text-[#E0A526]">Bs {saldoCaja.toFixed(2)}</span>
                    <p className="text-sm text-[#C9B096] mt-2 font-medium">Saldo en caja hoy</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTA 2: AMBIENTES */}
          {seccionActiva === 'ambientes' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Ambientes</h2>
                  <p className="text-sm text-[#C9B096] mt-0.5">Gestión de 23 ambientes, tarifas y asignación inmediata a limpieza</p>
                </div>

                <div className="px-4 py-2 rounded-xl bg-[#24170E] border border-[#3D2817] text-xs font-medium text-[#F5EBDC]">
                  « <span className="text-[#5FD08E] font-bold">{conteoLibres} libres</span> ·{' '}
                  <span className="text-[#F28C38] font-bold">{conteoOcupadas} ocupadas</span> ·{' '}
                  <span className="text-[#F0C14B] font-bold">{conteoPendientes} pendientes</span> ·{' '}
                  <span className="text-[#F472B6] font-bold">{conteoPagadas} pagadas</span> ·{' '}
                  <span className="text-[#6DB7D9] font-bold">{conteoLimpieza} en limpieza</span> »
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs text-[#C9B096]">Filtrar por:</span>

                <button
                  onClick={() => setFiltroAmbienteEstado('todos')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    filtroAmbienteEstado === 'todos' ? 'bg-[#E0A526] text-[#1E140C] border-[#E0A526]' : 'bg-[#24170E] border-[#3D2817] text-[#C9B096]'
                  }`}
                >
                  Todos
                </button>

                <button
                  onClick={() => setFiltroAmbienteEstado('disponible')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    filtroAmbienteEstado === 'disponible' ? 'bg-[#2F7D4F] text-white border-[#5FD08E]' : 'bg-[#24170E] border-[#3D2817] text-[#5FD08E]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#5FD08E]" /> Libres
                </button>

                <button
                  onClick={() => setFiltroAmbienteEstado('ocupada')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    filtroAmbienteEstado === 'ocupada' ? 'bg-[#C2570C] text-white border-[#F28C38]' : 'bg-[#24170E] border-[#3D2817] text-[#F28C38]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#F28C38]" /> Ocupadas
                </button>

                <button
                  onClick={() => setFiltroAmbienteEstado('limpieza')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    filtroAmbienteEstado === 'limpieza' ? 'bg-[#2D6F8E] text-white border-[#6DB7D9]' : 'bg-[#24170E] border-[#3D2817] text-[#6DB7D9]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#6DB7D9]" /> En limpieza
                </button>
              </div>

              {/* Cuadrícula de Ambientes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {ambientesFiltrados.map((a) => {
                  let badgeBg = 'bg-[#2F7D4F]/20 text-[#5FD08E] border-[#2F7D4F]';
                  let estadoTexto = 'Libre';

                  if (a.estado === 'ocupada') {
                    badgeBg = 'bg-[#C2570C]/20 text-[#F28C38] border-[#C2570C]';
                    estadoTexto = 'Ocupada';
                  } else if (a.estado === 'pendiente') {
                    badgeBg = 'bg-[#96690F]/20 text-[#F0C14B] border-[#96690F]';
                    estadoTexto = 'Pendiente';
                  } else if (a.estado === 'pagada') {
                    badgeBg = 'bg-[#BE185D]/20 text-[#F472B6] border-[#BE185D]';
                    estadoTexto = 'Pagada';
                  } else if (a.estado === 'limpieza') {
                    badgeBg = 'bg-[#2D6F8E]/20 text-[#6DB7D9] border-[#2D6F8E]';
                    estadoTexto = 'En Limpieza';
                  }

                  // Próximas reservas en esta habitación
                  const hoyStr = new Date().toISOString().split('T')[0];
                  const proxHab = reservas.filter(r => 
                    (r.ambienteId === a.id || r.ambienteCodigo === a.codigo || r.ambienteCodigo === a.nombre || (a.nombre && a.nombre.includes(r.ambienteCodigo))) &&
                    r.fechaSalida >= hoyStr
                  );

                  return (
                    <div
                      key={a.id}
                      className="rounded-2xl p-4 bg-[#24170E] border border-[#3D2817] hover:border-[#E0A526] transition-all flex flex-col justify-between min-h-[170px] shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-['Young_Serif',serif] text-lg text-[#F5EBDC]">{a.codigo}</span>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${badgeBg} font-semibold`}>
                            {estadoTexto}
                          </span>
                        </div>

                        <div className="my-2">
                          <p className="text-xs text-[#C9B096] font-semibold">{a.tipo}</p>
                          <p className="text-[11px] text-[#F5EBDC]/80 mt-0.5">Cap: {a.capacidad} pers · Bs {a.tarifa_base}</p>
                        </div>

                        {/* Indicador de reservas próximas en la habitación */}
                        {proxHab.length > 0 && (
                          <div className="mt-1.5 p-1.5 rounded-lg bg-[#1E140C] border border-[#5A3418]/60 text-[10px]">
                            <span className="text-[#E0A526] font-bold block mb-0.5"> Próximas:</span>
                            {proxHab.slice(0, 2).map((p, pIdx) => (
                              <div key={pIdx} className="text-[#C9B096] flex items-center justify-between">
                                <span>{p.fechaEntrada.slice(5)} al {p.fechaSalida.slice(5)}</span>
                                <span className="text-white font-semibold truncate ml-1">{p.huespedNombre}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#3D2817] flex items-center justify-between gap-1 text-[11px]">
                        {a.estado === 'disponible' && (
                          <>
                            <button
                              onClick={() => {
                                const nomAmb = a.nombre || a.codigo;
                                setReservaAmbiente(nomAmb);
                                setReservaAmbienteId(a.id);
                                const hoy = new Date().toISOString().split('T')[0];
                                const man = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                                verificarYLimpiarPorFecha(hoy, man);
                                setShowNuevaReservaModal(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-[#E0A526] text-[#1E140C] font-bold hover:bg-[#F28C38] cursor-pointer"
                            >
                              Reservar
                            </button>
                            <button
                              onClick={() => handleAsignarLimpieza(a.codigo)}
                              className="px-2 py-1 rounded-lg bg-[#2D1E12] border border-[#5A3418] text-[#6DB7D9] hover:bg-[#3D2817] cursor-pointer"
                            >
                              Limpieza
                            </button>
                          </>
                        )}

                        {a.estado === 'limpieza' && (
                          <button
                            onClick={() => handleLiberarHabitacion(a.codigo)}
                            className="w-full py-1 rounded-lg bg-[#2D6F8E] hover:bg-[#2F7D4F] text-white font-bold cursor-pointer"
                          >
                            ✓ Marcar como Lista
                          </button>
                        )}

                        {a.estado === 'ocupada' && (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-[#E0A526] truncate text-[10px]">{a.huespedActual || 'Ocupada'}</span>
                            <button
                              onClick={() => {
                                const est = estadias.find(e => e.ambienteCodigo === a.codigo && e.estado === 'en_curso');
                                if (est) setShowCheckOutWarning(est);
                              }}
                              className="px-2 py-0.5 rounded bg-[#C2570C] text-white font-semibold cursor-pointer"
                            >
                              Salida
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 3: RESERVAS CON CALENDARIO TIPO EXCEL */}
          {seccionActiva === 'reservas' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Reservas</h2>
                  <p className="text-sm text-[#C9B096] mt-0.5">Gestión de calendario, solicitudes en línea y reservas confirmadas</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex rounded-xl bg-[#24170E] border border-[#3D2817] p-1 text-xs font-semibold">
                    <button
                      onClick={() => setVistaReservas('calendario')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        vistaReservas === 'calendario' ? 'bg-[#E0A526] text-[#1E140C]' : 'text-[#C9B096] hover:text-white'
                      }`}
                    >
                      Por Calendario (Excel)
                    </button>
                    <button
                      onClick={() => setVistaReservas('lista')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        vistaReservas === 'lista' ? 'bg-[#E0A526] text-[#1E140C]' : 'text-[#C9B096] hover:text-white'
                      }`}
                    >
                      Por Lista
                    </button>
                    <button
                      onClick={() => setVistaReservas('solicitudes')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        vistaReservas === 'solicitudes' ? 'bg-[#E0A526] text-[#1E140C]' : 'text-[#C9B096] hover:text-white'
                      }`}
                    >
                      <span>Solicitudes Web</span>
                      {solicitudesPendientes > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          vistaReservas === 'solicitudes' ? 'bg-[#1E140C] text-[#E0A526]' : 'bg-[#E0A526] text-[#1E140C]'
                        }`}>
                          {solicitudesPendientes}
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setReservaHuesped('');
                      setReservaDoc('');
                      setReservaTel('');
                      setShowNuevaReservaModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] font-bold text-xs shadow cursor-pointer"
                  >
                    + Nueva reserva
                  </button>
                </div>
              </div>

              {/* CALENDARIO TIPO EXCEL */}
              {vistaReservas === 'calendario' && (
                <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] p-4 shadow-xl space-y-3">
                  
                  {/* BARRA SUPERIOR: < Anterior, Hoy, Siguiente > y Píldoras de Estado */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3D2817] pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOffsetDias(prev => prev - 7)}
                        className="px-3 py-1.5 rounded-lg bg-[#2D1E12] border border-[#5A3418] text-xs font-semibold text-[#F5EBDC] hover:bg-[#3D2817] cursor-pointer"
                      >
                        ‹ Anterior
                      </button>
                      <button
                        onClick={() => setOffsetDias(0)}
                        className="px-3 py-1.5 rounded-lg bg-[#2D1E12] border border-[#5A3418] text-xs font-semibold text-[#F5EBDC] hover:bg-[#3D2817] cursor-pointer"
                      >
                        Hoy
                      </button>
                      <button
                        onClick={() => setOffsetDias(prev => prev + 7)}
                        className="px-3 py-1.5 rounded-lg bg-[#2D1E12] border border-[#5A3418] text-xs font-semibold text-[#F5EBDC] hover:bg-[#3D2817] cursor-pointer"
                      >
                        Siguiente ›
                      </button>
                      <span className="text-xs text-[#E0A526] font-bold ml-2">{mesVisible}</span>
                    </div>

                    {/* Leyenda de Píldoras */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold border border-[#96690F] text-[#F0C14B] bg-[#96690F]/20">
                        Pendiente
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold border border-[#2F7D4F] text-[#5FD08E] bg-[#2F7D4F]/20">
                        Confirmada
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold border border-[#C2570C] text-[#F28C38] bg-[#C2570C]/20">
                        En curso
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold border border-[#5A3418] text-[#C9B096] bg-[#2D1E12]">
                        Finalizada
                      </span>
                    </div>
                  </div>

                  {/* TABLA DE EXCEL */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#3D2817] bg-[#1E140C]">
                          <th className="p-3 text-[#C9B096] min-w-[140px] sticky left-0 bg-[#1E140C] z-10 font-bold">
                            Ambiente
                          </th>
                          {diasVentana.map((d, idx) => (
                            <th key={idx} className={`p-2 text-center min-w-[42px] border-l border-[#3D2817]/40 ${d.esHoy ? 'bg-[#E0A526]/10 text-[#E0A526] font-bold' : 'text-[#C9B096]'}`}>
                              <div className="text-xs font-bold">{d.num}</div>
                              <div className="text-[10px] opacity-75">{d.dia}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ambientes.map(a => {
                          const nombreLimpio = a.nombre || `${a.codigo} ${a.tipo}`;
                          return (
                            <tr key={a.id} className="border-b border-[#3D2817]/40 hover:bg-[#2D1E12]/40">
                              <td className="p-2.5 font-medium text-[#F5EBDC] sticky left-0 bg-[#24170E] z-10 text-[11px]">
                                {nombreLimpio}
                              </td>

                              {diasVentana.map((d, idx) => {
                                // Buscar reserva vinculando por ID único, nombre o código
                                const res = reservas.find(r => 
                                  (r.ambienteId === a.id || 
                                   r.ambienteCodigo === a.codigo || 
                                   r.ambienteCodigo === nombreLimpio || 
                                   (a.nombre && r.ambienteCodigo && a.nombre.toLowerCase().includes(r.ambienteCodigo.toLowerCase())) ||
                                   (r.ambienteCodigo && a.codigo && r.ambienteCodigo.toLowerCase().includes(a.codigo.toLowerCase()))) &&
                                  d.fecha >= r.fechaEntrada && d.fecha <= r.fechaSalida
                                );

                                const esSeleccionada = celdaInicio && celdaInicio.room === nombreLimpio && celdaInicio.fecha === d.fecha;

                                let celdaClase = 'border-l border-[#3D2817]/40 p-1 text-center cursor-pointer transition-colors';
                                let contenido = null;

                                if (res) {
                                  const primerNombre = res.huespedNombre ? res.huespedNombre.split(' ')[0] : 'Ocup';
                                  if (res.estado === 'confirmada' || res.estadoPago === 'confirmada') {
                                    celdaClase += ' bg-[#2F7D4F]/30 text-[#5FD08E] border border-[#2F7D4F]';
                                    contenido = <span className="text-[9px] font-bold truncate block">{primerNombre}</span>;
                                  } else if (res.estado === 'en_curso') {
                                    celdaClase += ' bg-[#C2570C]/30 text-[#F28C38] border border-[#C2570C]';
                                    contenido = <span className="text-[9px] font-bold truncate block">{primerNombre}</span>;
                                  } else {
                                    celdaClase += ' bg-[#96690F]/30 text-[#F0C14B] border border-[#96690F]';
                                    contenido = <span className="text-[9px] font-bold truncate block">{primerNombre}</span>;
                                  }
                                } else if (esSeleccionada) {
                                  celdaClase += ' bg-[#E0A526]/40 border-2 border-[#E0A526]';
                                } else {
                                  celdaClase += ' hover:bg-[#3D2817]/60';
                                }

                                return (
                                  <td
                                    key={idx}
                                    onClick={() => handleCeldaClick(nombreLimpio, d.fecha)}
                                    className={celdaClase}
                                    style={{ height: '32px' }}
                                    title={`${nombreLimpio} — ${d.fecha}`}
                                  >
                                    {contenido}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VISTA 3.2: POR LISTA */}
              {vistaReservas === 'lista' && (
                <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] overflow-hidden shadow-xl">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#3D2817] bg-[#1E140C] text-[#C9B096]">
                        <th className="p-3.5 font-semibold">Huésped</th>
                        <th className="p-3.5 font-semibold">Ambiente</th>
                        <th className="p-3.5 font-semibold">Fecha Entrada</th>
                        <th className="p-3.5 font-semibold">Fecha Salida</th>
                        <th className="p-3.5 font-semibold">Estado de Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-[#C9B096]">No hay reservas registradas en la base de datos.</td>
                        </tr>
                      ) : (
                        reservas.map(r => (
                          <tr key={r.id} className="border-b border-[#3D2817] hover:bg-[#2D1E12]/50">
                            <td className="p-3.5 font-medium text-white">{r.huespedNombre}</td>
                            <td className="p-3.5 text-[#F5EBDC]">{r.ambienteCodigo}</td>
                            <td className="p-3.5 text-[#C9B096]">{r.fechaEntrada}</td>
                            <td className="p-3.5 text-[#C9B096]">{r.fechaSalida}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                r.estadoPago === 'confirmada' ? 'bg-[#2F7D4F]/20 text-[#5FD08E] border-[#2F7D4F]' : 'bg-[#96690F]/20 text-[#F0C14B] border-[#96690F]'
                              }`}>
                                {r.estadoPago === 'confirmada' ? 'Pagada' : 'Pendiente'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VISTA 3.3: SOLICITUDES EN LÍNEA DE CLIENTES (WEB) */}
              {vistaReservas === 'solicitudes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#C9B096]">
                      Solicitudes de reserva recibidas en tiempo real desde la página web pública de Hotel Asiri.
                    </p>
                    <span className="text-xs text-[#E0A526] font-semibold">
                      {solicitudesPendientes} pendiente{solicitudesPendientes !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] overflow-hidden shadow-xl">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#3D2817] bg-[#1E140C] text-[#C9B096]">
                          <th className="p-3.5 font-semibold">Cliente / Huésped</th>
                          <th className="p-3.5 font-semibold">Contacto</th>
                          <th className="p-3.5 font-semibold">Habitación</th>
                          <th className="p-3.5 font-semibold">Fechas</th>
                          <th className="p-3.5 font-semibold">Personas</th>
                          <th className="p-3.5 font-semibold">Estado</th>
                          <th className="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudes.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-[#C9B096]">
                              No hay solicitudes de reserva web registradas todavía.
                            </td>
                          </tr>
                        ) : (
                          solicitudes.map(s => (
                            <tr key={s.id} className="border-b border-[#3D2817]/60 hover:bg-[#2D1E12]/50">
                              <td className="p-3.5">
                                <div className="font-bold text-white">{s.nombre}</div>
                                {s.email && <div className="text-[11px] text-[#C9B096]">{s.email}</div>}
                              </td>
                              <td className="p-3.5 text-[#F5EBDC] font-mono">{s.telefono}</td>
                              <td className="p-3.5">
                                <span className="font-semibold text-[#E0A526]">{s.ambienteCodigo}</span>
                              </td>
                              <td className="p-3.5 text-[#C9B096]">
                                <div>{s.fechaEntrada} <span className="text-[#E0A526]">→</span> {s.fechaSalida}</div>
                              </td>
                              <td className="p-3.5 text-[#F5EBDC]">{s.personas} pers.</td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                  s.estado === 'confirmada'
                                    ? 'bg-[#2F7D4F]/20 text-[#5FD08E] border-[#2F7D4F]'
                                    : s.estado === 'rechazada'
                                    ? 'bg-[#C2570C]/20 text-[#F28C38] border-[#C2570C]'
                                    : 'bg-[#96690F]/20 text-[#F0C14B] border-[#96690F] animate-pulse'
                                }`}>
                                  {s.estado.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-2">
                                {s.estado === 'pendiente' ? (
                                  <>
                                    <button
                                      onClick={() => handleAprobarSolicitud(s)}
                                      className="px-3 py-1.5 rounded-lg bg-[#2F7D4F] hover:bg-[#3FA066] text-white text-xs font-bold transition-all shadow cursor-pointer"
                                      title="Aprobar y registrar en el calendario"
                                    >
                                      ✓ Aprobar
                                    </button>
                                    <button
                                      onClick={() => handleRechazarSolicitud(s.id)}
                                      className="px-3 py-1.5 rounded-lg bg-[#2D1E12] hover:bg-[#3D2817] text-[#C9B096] hover:text-white text-xs font-semibold border border-[#5A3418] cursor-pointer"
                                      title="Rechazar solicitud"
                                    >
                                      ✕ Rechazar
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-[#C9B096] italic">Procesada</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTA 4: CHECK-IN / CHECK-OUT */}
          {seccionActiva === 'checkin_out' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Check-in / Check-out</h2>
                <p className="text-sm text-[#C9B096] mt-0.5">Control de entradas (8:30 a 12:00) y salidas (hasta 11:00)</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] p-5 space-y-3.5 shadow-xl">
                  <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] border-b border-[#3D2817] pb-3">Llegadas pendientes</h3>
                  {estadias.filter(e => e.estado === 'confirmada').length === 0 ? (
                    <p className="text-xs text-[#C9B096]">No hay check-ins pendientes.</p>
                  ) : (
                    estadias.filter(e => e.estado === 'confirmada').map(e => (
                      <div key={e.id} className="p-4 rounded-xl bg-[#2D1E12] border border-[#3D2817] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#F5EBDC] text-sm">{e.huespedNombre} · {e.ambienteCodigo}</p>
                          <p className="text-xs text-[#C9B096]">Doc: {e.documento}</p>
                        </div>
                        <button
                          onClick={() => setShowCheckInModal(e)}
                          className="px-3.5 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] font-bold text-xs cursor-pointer"
                        >
                          Check-in →
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] p-5 space-y-3.5 shadow-xl">
                  <h3 className="font-['Young_Serif',serif] text-xl text-[#F5EBDC] border-b border-[#3D2817] pb-3">Huéspedes Alojados</h3>
                  {estadias.filter(e => e.estado === 'en_curso').length === 0 ? (
                    <p className="text-xs text-[#C9B096]">No hay huéspedes alojados actualmente.</p>
                  ) : (
                    estadias.filter(e => e.estado === 'en_curso').map(e => (
                      <div key={e.id} className="p-4 rounded-xl bg-[#2D1E12] border border-[#3D2817] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#F5EBDC] text-sm">{e.huespedNombre} · {e.ambienteCodigo}</p>
                          <p className="text-xs text-[#C9B096]">Salida: {e.fechaSalida}</p>
                        </div>
                        <button
                          onClick={() => setShowCheckOutWarning(e)}
                          className="px-3.5 py-2 rounded-xl bg-[#3D2817] hover:bg-[#C2570C] text-[#F5EBDC] font-bold text-xs border border-[#5A3418] cursor-pointer"
                        >
                          Check-out
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VISTA 5: HUÉSPEDES */}
          {seccionActiva === 'huespedes' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Huéspedes</h2>
                  <p className="text-sm text-[#C9B096] mt-0.5">Directorio de huéspedes, códigos HU- y control de fotocopias</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] overflow-hidden shadow-xl">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#3D2817] bg-[#1E140C] text-[#C9B096]">
                      <th className="p-3.5 font-semibold">Perfil</th>
                      <th className="p-3.5 font-semibold">Nombre</th>
                      <th className="p-3.5 font-semibold">Documento</th>
                      <th className="p-3.5 font-semibold">Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {huespedes.map(h => (
                      <tr key={h.id} className="border-b border-[#3D2817] hover:bg-[#2D1E12]/50">
                        <td className="p-3.5 font-bold text-[#E0A526]">{h.codigo}</td>
                        <td className="p-3.5 font-medium text-white">{h.nombre}</td>
                        <td className="p-3.5 text-[#F5EBDC]">{h.documento}</td>
                        <td className="p-3.5 text-[#C9B096]">{h.contacto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 6: CAJA Y PAGOS */}
          {seccionActiva === 'caja' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Caja y Pagos</h2>
                  <p className="text-sm text-[#C9B096] mt-0.5">Control de ingresos, egresos y comprobantes QR/Transferencias</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNuevoEgresoModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#3D2817] hover:bg-[#5A3418] border border-[#5A3418] text-xs font-semibold cursor-pointer"
                  >
                    - Registrar egreso
                  </button>
                  <button
                    onClick={() => setShowNuevoIngresoModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] text-xs font-bold shadow cursor-pointer"
                  >
                    + Registrar ingreso
                  </button>
                  <button
                    onClick={() => setShowCierreCajaModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#2D6F8E] hover:bg-[#2F7D4F] text-white text-xs font-bold cursor-pointer"
                  >
                    Cierre de turno
                  </button>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-[#24170E] border border-[#3D2817] shadow-xl">
                  <span className="text-xs text-[#C9B096] font-semibold">Ingresos registrados hoy</span>
                  <p className="font-['Young_Serif',serif] text-3xl text-[#5FD08E] mt-1">+ Bs {totalIngresos.toFixed(2)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#24170E] border border-[#3D2817] shadow-xl">
                  <span className="text-xs text-[#C9B096] font-semibold">Egresos registrados hoy</span>
                  <p className="font-['Young_Serif',serif] text-3xl text-[#F28C38] mt-1">- Bs {totalEgresos.toFixed(2)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#24170E] border border-[#5A3418] shadow-xl">
                  <span className="text-xs text-[#E0A526] font-semibold">Saldo total en caja</span>
                  <p className="font-['Young_Serif',serif] text-3xl text-[#E0A526] mt-1">Bs {saldoCaja.toFixed(2)}</p>
                </div>
              </div>

              {/* Tabla de Movimientos */}
              <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] overflow-hidden shadow-xl">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#3D2817] bg-[#1E140C] text-[#C9B096]">
                      <th className="p-3.5 font-semibold">Fecha</th>
                      <th className="p-3.5 font-semibold">Tipo</th>
                      <th className="p-3.5 font-semibold">Categoría</th>
                      <th className="p-3.5 font-semibold">Detalle</th>
                      <th className="p-3.5 font-semibold">Método</th>
                      <th className="p-3.5 font-semibold text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cajaMovimientos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-[#C9B096]">No hay movimientos registrados en la base de datos.</td>
                      </tr>
                    ) : (
                      cajaMovimientos.map(m => (
                        <tr key={m.id} className="border-b border-[#3D2817] hover:bg-[#2D1E12]/50">
                          <td className="p-3.5 text-[#C9B096]">{m.fecha}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              m.tipo === 'ingreso' ? 'bg-[#2F7D4F]/20 text-[#5FD08E]' : 'bg-[#C2570C]/20 text-[#F28C38]'
                            }`}>
                              {m.tipo.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-white">{m.categoria}</td>
                          <td className="p-3.5 text-[#C9B096]">{m.detalle}</td>
                          <td className="p-3.5 text-white">{m.metodo}</td>
                          <td className={`p-3.5 text-right font-bold text-sm ${
                            m.tipo === 'ingreso' ? 'text-[#5FD08E]' : 'text-[#F28C38]'
                          }`}>
                            {m.tipo === 'ingreso' ? '+' : '-'} Bs {m.monto.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 7: LIMPIEZA */}
          {seccionActiva === 'limpieza' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Limpieza</h2>
                  <p className="text-sm text-[#C9B096] mt-0.5">Control de cuartos en desinfección y preparación de ambientes</p>
                </div>

                <button
                  onClick={() => setShowNuevaTareaModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] text-xs font-bold shadow cursor-pointer"
                >
                  + Nueva tarea
                </button>
              </div>

              {tareasLimpieza.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#24170E] border border-[#3D2817] text-center text-sm text-[#C9B096]">
                  No hay tareas de limpieza pendientes en este momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tareasLimpieza.map(t => (
                    <div key={t.id} className="p-5 rounded-2xl bg-[#24170E] border border-[#3D2817] flex flex-col justify-between space-y-4 shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[#E0A526] text-base">{t.ambienteCodigo}</span>
                          <span className="px-2 py-0.5 rounded text-[11px] bg-[#2D6F8E]/20 text-[#6DB7D9] border border-[#2D6F8E] font-semibold">
                            {t.origen === 'checkout' ? 'Salida de Huésped' : 'Manual'}
                          </span>
                        </div>
                        <p className="text-sm text-[#F5EBDC]">{t.tarea}</p>
                        <p className="text-xs text-[#C9B096] mt-2">Asignado a: <strong className="text-white">{t.responsable}</strong></p>
                      </div>

                      <button
                        onClick={() => handleLiberarHabitacion(t.ambienteCodigo)}
                        className="w-full py-2.5 rounded-xl bg-[#2D6F8E] hover:bg-[#2F7D4F] text-white text-xs font-bold transition-all shadow cursor-pointer"
                      >
                        ✓ Marcar como Lista (Liberar Habitación)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VISTA 8: CONTROL DE PERSONAL (USUARIOS) */}
          {seccionActiva === 'usuarios' && esAdmin && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Control de personal</h2>
                  <p className="text-sm text-[#C9B096] mt-0.5">Altas, bajas y roles del personal del hotel</p>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] font-bold text-xs shadow transition-all cursor-pointer"
                >
                  + Añadir Nuevo Personal
                </button>
              </div>

              <div className="rounded-2xl border border-[#3D2817] bg-[#24170E] overflow-hidden shadow-xl">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#3D2817] bg-[#1E140C] text-[#C9B096]">
                      <th className="p-3.5 font-semibold">Nombre Completo</th>
                      <th className="p-3.5 font-semibold">Correo Electrónico</th>
                      <th className="p-3.5 font-semibold">Rol Asignado</th>
                      <th className="p-3.5 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personal.map(p => (
                      <tr key={p.id} className="border-b border-[#3D2817] hover:bg-[#2D1E12]/50">
                        <td className="p-3.5 font-bold text-white">{p.nombre}</td>
                        <td className="p-3.5 text-[#C9B096]">{p.email}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            p.rol === 'administrador'
                              ? 'bg-[#E0A526]/20 text-[#E0A526] border-[#E0A526]'
                              : p.rol === 'recepcionista'
                              ? 'bg-[#2F7D4F]/20 text-[#5FD08E] border-[#2F7D4F]'
                              : 'bg-[#2D6F8E]/20 text-[#6DB7D9] border-[#2D6F8E]'
                          }`}>
                            {p.rol.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {p.activo ? (
                            <span className="text-[#5FD08E] font-semibold">✓ Activo</span>
                          ) : (
                            <span className="text-[#6E5644]">Inactivo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 9: ATENCIÓN AL CLIENTE */}
          {seccionActiva === 'atencion' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Young_Serif',serif] text-3xl text-[#F5EBDC]">Atención al cliente</h2>
                  <p className="text-sm text-[#C9B096] mt-0.5">Peticiones, requerimientos especiales y quejas de huéspedes</p>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-[#24170E] border border-[#3D2817] text-center text-sm text-[#C9B096]">
                No hay quejas ni solicitudes registradas en la base de datos.
              </div>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER OFICIAL */}
      <footer className="bg-[#120B06] border-t border-[#3D2817] py-3 text-center text-xs text-[#C9B096]">
        © 2026 Hotel Asiri · Sistema de Gestión Hotelera
      </footer>

      {/* ========================================================
          MODALES DE GESTIÓN CONECTADOS A SUPABASE
         ======================================================== */}

      {/* 1. MODAL REGISTRAR INGRESO (FIEL A LA IMAGEN 2) */}
      {showNuevoIngresoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 text-[#F5EBDC] space-y-4 shadow-2xl">
            <h3 className="font-['Young_Serif',serif] text-2xl text-[#E0A526]">Registrar ingreso</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Fecha *</label>
                <input
                  type="date"
                  value={nuevoMovFecha}
                  onChange={(e) => setNuevoMovFecha(e.target.value)}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Categoría *</label>
                <select
                  value={nuevoMovCategoria}
                  onChange={(e) => setNuevoMovCategoria(e.target.value)}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#F5EBDC] outline-none"
                >
                  <option value="Hospedaje">Hospedaje</option>
                  <option value="Coworking">Coworking</option>
                  <option value="Cafetería">Cafetería / Desayuno</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Reserva vinculada</label>
                <select
                  value={nuevoMovReservaVinculada}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setNuevoMovReservaVinculada(selId);
                    const res = reservas.find(r => r.id === selId);
                    if (res) {
                      setNuevoMovDetalle(`Cobro estadía ${res.ambienteCodigo} - ${res.huespedNombre}`);
                      setNuevoMovMonto(String(res.montoTotal || 300));
                    }
                  }}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#F5EBDC] outline-none"
                >
                  <option value="">— sin vincular —</option>
                  {reservas.filter(r => r.estadoPago === 'pendiente').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.ambienteCodigo} — {r.huespedNombre} (Por pagar: Bs {r.montoTotal || 300})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Detalle *</label>
                <input
                  type="text"
                  value={nuevoMovDetalle}
                  onChange={(e) => setNuevoMovDetalle(e.target.value)}
                  placeholder="Ej. Cobro estadía HAB-101"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Monto (Bs) *</label>
                <input
                  type="number"
                  value={nuevoMovMonto}
                  onChange={(e) => setNuevoMovMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Método *</label>
                <select
                  value={nuevoMovMetodo}
                  onChange={(e) => setNuevoMovMetodo(e.target.value as any)}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#E0A526] outline-none"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Pago QR (Presencial)">Pago QR (Presencial)</option>
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="Transferencia">Transferencia bancaria</option>
                </select>
              </div>

              {nuevoMovMetodo === 'Pago QR (Presencial)' && (
                <div className="p-3 rounded-xl bg-[#1E140C] border border-[#3D2817] space-y-1.5">
                  <label className="block text-xs text-[#E0A526] font-semibold">
                    Comprobante de pago QR (Subir captura / recibo):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNuevoMovComprobante(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="text-xs text-[#C9B096]"
                  />
                  {nuevoMovComprobante && (
                    <p className="text-[11px] text-[#5FD08E]">✓ Archivo seleccionado correctamente.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3D2817]">
              <button
                onClick={() => setShowNuevoIngresoModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2D1E12] text-xs font-semibold text-[#C9B096] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarIngreso}
                className="px-5 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] font-bold text-xs shadow cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

            {/* 2. MODAL NUEVA RESERVA */}
      {showNuevaReservaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 text-[#F5EBDC] space-y-4 shadow-2xl">
            <h3 className="font-['Young_Serif',serif] text-2xl text-[#E0A526]">Nueva reserva</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Ambiente / Habitación *</label>
                <select
                  value={reservaAmbiente}
                  onChange={(e) => {
                    const sel = e.target.value;
                    setReservaAmbiente(sel);
                    const ambObj = ambientes.find(a => a.id === sel || a.nombre === sel || a.codigo === sel);
                    if (ambObj) setReservaAmbienteId(ambObj.id);
                    verificarYLimpiarPorFecha(reservaEntrada, reservaSalida);
                  }}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#F5EBDC]"
                >
                  {ambientes.map(a => (
                    <option key={a.id} value={a.nombre || `${a.codigo} ${a.tipo}`}>
                      {a.nombre || `${a.codigo} ${a.tipo}`}
                    </option>
                  ))}
                </select>

                {/* PRÓXIMAS RESERVAS REGISTRADAS (Sin filas duplicadas) */}
                {(() => {
                  const amb = ambientes.find(a => 
                    (reservaAmbienteId && a.id === reservaAmbienteId) ||
                    a.nombre === reservaAmbiente || 
                    a.codigo === reservaAmbiente || 
                    reservaAmbiente.includes(a.codigo)
                  );
                  const hoyStr = new Date().toISOString().split('T')[0];
                  
                  // Filtra y elimina filas duplicadas por clics repetidos previos
                  const prox = reservas
                    .filter(r => 
                      (r.ambienteId === amb?.id || r.ambienteCodigo === amb?.codigo || r.ambienteCodigo === amb?.nombre || r.ambienteCodigo === reservaAmbiente) &&
                      r.fechaSalida >= hoyStr
                    )
                    .filter((r, idx, arr) => 
                      arr.findIndex(item => item.fechaEntrada === r.fechaEntrada && item.fechaSalida === r.fechaSalida && item.huespedNombre === r.huespedNombre) === idx
                    );

                  if (prox.length === 0) return null;
                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#1E140C] border border-[#5A3418] text-xs">
                      <span className="text-[#E0A526] font-bold block mb-1">
                         Próximas reservas en {amb?.nombre || reservaAmbiente}:
                      </span>
                      <div className="space-y-1">
                        {prox.map((p, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setReservaEntrada(p.fechaEntrada);
                              setReservaSalida(p.fechaSalida);
                              setReservaHuesped(p.huespedNombre);
                              setReservaDoc(p.documento || '');
                              setReservaTel(p.contacto || '');
                              setReservaEstadoPago(p.estadoPago as any || 'pendiente');
                            }}
                            className="flex items-center justify-between p-1.5 rounded bg-[#24170E] hover:bg-[#2D1E12] cursor-pointer text-[#C9B096] text-[11px] transition-colors"
                            title="Click para ver/cargar esta reserva"
                          >
                            <span>{p.fechaEntrada} al {p.fechaSalida}</span>
                            <span className="font-semibold text-white">{p.huespedNombre}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.estadoPago === 'confirmada' ? 'bg-[#2F7D4F]/30 text-[#5FD08E]' : 'bg-[#96690F]/30 text-[#F0C14B]'}`}>
                              {p.estadoPago === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#C9B096] font-semibold">Nombre del huésped *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setReservaHuesped('');
                      setReservaDoc('');
                      setReservaTel('');
                    }}
                    className="text-[11px] text-[#E0A526] hover:underline cursor-pointer"
                  >
                    Limpiar campos
                  </button>
                </div>
                <input
                  type="text"
                  value={reservaHuesped}
                  onChange={(e) => setReservaHuesped(e.target.value)}
                  placeholder="Ej. Juana"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Documento de identidad</label>
                <input
                  type="text"
                  value={reservaDoc}
                  onChange={(e) => setReservaDoc(e.target.value)}
                  placeholder="Ej. 10452636"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Teléfono o WhatsApp</label>
                <input
                  type="text"
                  value={reservaTel}
                  onChange={(e) => setReservaTel(e.target.value)}
                  placeholder="Ej. 63920014"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#C9B096] mb-1 font-semibold">Fecha Entrada *</label>
                  <input
                    type="date"
                    value={reservaEntrada}
                    onChange={(e) => verificarYLimpiarPorFecha(e.target.value, reservaSalida)}
                    className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#C9B096] mb-1 font-semibold">Fecha Salida *</label>
                  <input
                    type="date"
                    value={reservaSalida}
                    onChange={(e) => verificarYLimpiarPorFecha(reservaEntrada, e.target.value)}
                    className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Estado de pago *</label>
                <select
                  value={reservaEstadoPago}
                  onChange={(e) => setReservaEstadoPago(e.target.value as any)}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#E0A526]"
                >
                  <option value="pendiente">Pendiente de pago (Por pagar)</option>
                  <option value="confirmada">Confirmada (Pagada)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3D2817]">
              <button
                onClick={() => {
                  setShowNuevaReservaModal(false);
                  setCeldaInicio(null);
                }}
                disabled={guardandoReserva}
                className="px-4 py-2 rounded-xl bg-[#2D1E12] text-xs font-semibold text-[#C9B096] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarReserva}
                disabled={guardandoReserva}
                className={`px-5 py-2 rounded-xl text-[#1E140C] font-bold text-xs shadow transition-all ${
                  guardandoReserva 
                    ? 'bg-[#A87B1D] opacity-60 cursor-not-allowed' 
                    : 'bg-[#E0A526] hover:bg-[#F28C38] cursor-pointer'
                }`}
              >
                {guardandoReserva ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL AÑADIR NUEVO PERSONAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 text-[#F5EBDC] space-y-4 shadow-2xl">
            <h3 className="font-['Young_Serif',serif] text-2xl text-[#E0A526]">Añadir nuevo personal</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Nombre Completo *</label>
                <input
                  type="text"
                  value={nuevoUserNombre}
                  onChange={(e) => setNuevoUserNombre(e.target.value)}
                  placeholder="Ej. María Sánchez"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Correo Electrónico *</label>
                <input
                  type="email"
                  value={nuevoUserEmail}
                  onChange={(e) => setNuevoUserEmail(e.target.value)}
                  placeholder="personal@hotelasiri.com"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Contraseña Provisional *</label>
                <input
                  type="password"
                  value={nuevoUserPass}
                  onChange={(e) => setNuevoUserPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Rol Asignado *</label>
                <select
                  value={nuevoUserRol}
                  onChange={(e) => setNuevoUserRol(e.target.value as any)}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#E0A526] outline-none"
                >
                  <option value="recepcionista">Recepcionista</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3D2817]">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2D1E12] text-xs font-semibold text-[#C9B096] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarPersonal}
                className="px-5 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] font-bold text-xs shadow cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL NUEVA TAREA LIMPIEZA */}
      {showNuevaTareaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 text-[#F5EBDC] space-y-4 shadow-2xl">
            <h3 className="font-['Young_Serif',serif] text-2xl text-[#E0A526]">Nueva tarea de limpieza</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Ambiente / Habitación *</label>
                <select value={nuevaTareaAmbiente} onChange={(e) => setNuevaTareaAmbiente(e.target.value)} className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#F5EBDC]">
                  {ambientes.map(a => (
                    <option key={a.id} value={a.codigo}>{a.codigo} — {a.tipo}</option>
                  ))}
                  <option value="AC — Pasillos">AC — Áreas comunes / Pasillos</option>
                  <option value="AC — Lobby">AC — Lobby Principal</option>
                </select>
              </div>
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Descripción de la tarea *</label>
                <input type="text" value={nuevaTareaDesc} onChange={(e) => setNuevaTareaDesc(e.target.value)} placeholder="Ej. Cambio de sábanas y desinfección" className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Responsable</label>
                <input type="text" value={nuevaTareaResponsable} onChange={(e) => setNuevaTareaResponsable(e.target.value)} className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3D2817]">
              <button onClick={() => setShowNuevaTareaModal(false)} className="px-4 py-2 rounded-xl bg-[#2D1E12] text-xs font-semibold text-[#C9B096] cursor-pointer">Cancelar</button>
              <button
                onClick={async () => {
                  if (!nuevaTareaDesc) {
                    mostrarNotificacion('Por favor ingresa la descripción de la tarea.');
                    return;
                  }
                  const nueva: TareaLimpieza = {
                    id: `t-${Date.now()}`,
                    ambienteCodigo: nuevaTareaAmbiente,
                    tarea: nuevaTareaDesc,
                    responsable: nuevaTareaResponsable,
                    origen: 'manual',
                    estado: 'pendiente'
                  };
                  setTareasLimpieza([nueva, ...tareasLimpieza]);
                  setShowNuevaTareaModal(false);
                  setNuevaTareaDesc('');
                  mostrarNotificacion('Tarea de limpieza creada exitosamente.');

                  try {
                    await supabase.from('tareas_limpieza').insert({
                      ambiente_codigo: nuevaTareaAmbiente,
                      tarea: nuevaTareaDesc,
                      responsable: nuevaTareaResponsable,
                      origen: 'manual',
                      estado: 'pendiente'
                    });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] font-bold text-xs shadow cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL REGISTRAR EGRESO */}
      {showNuevoEgresoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 text-[#F5EBDC] space-y-4 shadow-2xl">
            <h3 className="font-['Young_Serif',serif] text-2xl text-[#F28C38]">Registrar egreso</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Categoría *</label>
                <select value={nuevoMovCategoria} onChange={(e) => setNuevoMovCategoria(e.target.value)} className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#F5EBDC]">
                  <option value="Insumos cocina">Insumos cocina / Desayuno</option>
                  <option value="Limpieza">Artículos de limpieza</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Servicios básicos">Servicios básicos</option>
                </select>
              </div>
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Detalle *</label>
                <input type="text" value={nuevoMovDetalle} onChange={(e) => setNuevoMovDetalle(e.target.value)} placeholder="Ej. Compra de frutas y pan" className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">Monto (Bs) *</label>
                <input type="number" value={nuevoMovMonto} onChange={(e) => setNuevoMovMonto(e.target.value)} placeholder="0.00" className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3D2817]">
              <button onClick={() => setShowNuevoEgresoModal(false)} className="px-4 py-2 rounded-xl bg-[#2D1E12] text-xs font-semibold text-[#C9B096] cursor-pointer">Cancelar</button>
              <button
                onClick={async () => {
                  if (!nuevoMovMonto || !nuevoMovDetalle) {
                    mostrarNotificacion('Ingresa detalle y monto.');
                    return;
                  }
                  const nuevoEg: MovimientoCaja = {
                    id: `c-${Date.now()}`,
                    tipo: 'egreso',
                    fecha: new Date().toISOString().split('T')[0],
                    categoria: nuevoMovCategoria,
                    detalle: nuevoMovDetalle,
                    monto: parseFloat(nuevoMovMonto),
                    metodo: 'Efectivo'
                  };
                  setCajaMovimientos([nuevoEg, ...cajaMovimientos]);
                  setShowNuevoEgresoModal(false);
                  setNuevoMovDetalle('');
                  setNuevoMovMonto('');
                  mostrarNotificacion('Egreso registrado en caja.');

                  try {
                    await supabase.from('movimientos_caja').insert({
                      tipo: 'egreso',
                      fecha: new Date().toISOString().split('T')[0],
                      categoria: nuevoMovCategoria,
                      detalle: nuevoMovDetalle,
                      monto: parseFloat(nuevoMovMonto),
                      metodo: 'Efectivo'
                    });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#E0A526] hover:bg-[#F28C38] text-[#1E140C] font-bold text-xs shadow cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL CIERRE DE CAJA */}
      {showCierreCajaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 text-[#F5EBDC] space-y-4 shadow-2xl">
            <h3 className="font-['Young_Serif',serif] text-2xl text-[#E0A526]">Cierre de Caja / Fin de Turno</h3>
            <div className="p-4 rounded-xl bg-[#1E140C] border border-[#3D2817] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#C9B096]">Ingresos totales del día:</span>
                <span className="text-[#5FD08E] font-bold">Bs {totalIngresos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B096]">Egresos totales del día:</span>
                <span className="text-[#F28C38] font-bold">Bs {totalEgresos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#3D2817] pt-2">
                <span className="text-white font-bold">Efectivo esperado en caja:</span>
                <span className="text-[#E0A526] font-bold text-sm">Bs {saldoCaja.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowCierreCajaModal(false)} className="px-5 py-2 rounded-xl bg-[#E0A526] text-[#1E140C] font-bold text-xs cursor-pointer">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}