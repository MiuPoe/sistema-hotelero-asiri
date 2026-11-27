import { useState, useEffect } from "react";
import {
  Car,
  Coffee,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Tv,
  Wind,
  ShoppingCart,
  X,
  CheckCircle2,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import AuthModal from "../components/AuthModal";

interface HomePageProps {
  user?: {
    id: string;
    email: string;
    rol: string;
    nombre?: string;
    telefono?: string;
  } | null;
  onLogout?: () => void;
  onLoginSuccess?: (user: any) => void;
}

function BedIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
    </svg>
  );
}

function ShowerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h7a4 4 0 0 1 4 4v3H7V8a4 4 0 0 0-4-4z" />
      <path d="M7 15v-4h8v4" />
      <path d="M9 19v2M12 18v3M15 19v2" />
    </svg>
  );
}

function UtensilsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M18 11v11M6 2v7a3 3 0 0 0 3 3v10M6 12a3 3 0 0 1-3-3V2" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Lista completa de ambientes físicos del hotel para el selector de cine
const AMBIENTES_HOTEL = [
  // Piso 1
  {
    codigo: "HAB-101",
    piso: 1,
    tipo: "Simple",
    capacidad: 1,
    precio: 280,
    estado: "libre",
  },
  {
    codigo: "HAB-102",
    piso: 1,
    tipo: "Simple",
    capacidad: 1,
    precio: 280,
    estado: "libre",
  },
  {
    codigo: "HAB-103",
    piso: 1,
    tipo: "Matrimonial",
    capacidad: 2,
    precio: 300,
    estado: "libre",
  },
  {
    codigo: "HAB-104",
    piso: 1,
    tipo: "Doble",
    capacidad: 2,
    precio: 320,
    estado: "libre",
  },
  {
    codigo: "HAB-105",
    piso: 1,
    tipo: "Simple",
    capacidad: 1,
    precio: 280,
    estado: "libre",
  },
  // Piso 2
  {
    codigo: "HAB-201",
    piso: 2,
    tipo: "Doble",
    capacidad: 2,
    precio: 320,
    estado: "libre",
  },
  {
    codigo: "HAB-202",
    piso: 2,
    tipo: "Doble",
    capacidad: 2,
    precio: 320,
    estado: "libre",
  },
  {
    codigo: "HAB-203",
    piso: 2,
    tipo: "Familiar",
    capacidad: 4,
    precio: 420,
    estado: "libre",
  },
  {
    codigo: "HAB-204",
    piso: 2,
    tipo: "Simple",
    capacidad: 1,
    precio: 280,
    estado: "libre",
  },
  {
    codigo: "HAB-205",
    piso: 2,
    tipo: "Matrimonial",
    capacidad: 2,
    precio: 300,
    estado: "libre",
  },
  // Piso 3
  {
    codigo: "HAB-301",
    piso: 3,
    tipo: "Matrimonial",
    capacidad: 2,
    precio: 350,
    estado: "libre",
  },
  {
    codigo: "HAB-302",
    piso: 3,
    tipo: "Matrimonial",
    capacidad: 2,
    precio: 350,
    estado: "libre",
  },
];

export default function HomePage({
  user,
  onLogout,
  onLoginSuccess,
}: HomePageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showModalSolicitudCliente, setShowModalSolicitudCliente] =
    useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState("");
  const [solicitudEntrada, setSolicitudEntrada] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [solicitudSalida, setSolicitudSalida] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );
  const [solicitudPersonas, setSolicitudPersonas] = useState(1);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [notifCliente, setNotifCliente] = useState<string | null>(null);

  // ESTADOS DEL CARRITO Y SELECTOR TIPO CINE
  const [cartOpen, setCartOpen] = useState(false);
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);
  const [modalSelectorCineOpen, setModalSelectorCineOpen] = useState(false);
  const [solicitudActualParaHabitacion, setSolicitudActualParaHabitacion] =
    useState<any>(null);
  const [habitacionElegidaCine, setHabitacionElegidaCine] =
    useState<string>("");
  const [guardandoHabitacion, setGuardandoHabitacion] = useState(false);

  const mostrarNotifCliente = (msg: string) => {
    setNotifCliente(msg);
    setTimeout(() => setNotifCliente(null), 4500);
  };

  // Cargar solicitudes del cliente
  const cargarSolicitudesCliente = async () => {
    if (!user?.email) return;
    setCargandoSolicitudes(true);
    try {
      const { data, error } = await supabase
        .from("solicitudes_reserva")
        .select("*")
        .eq("email", user.email)
        .order("creado_en", { ascending: false });

      if (!error && data) {
        setMisSolicitudes(data);
      }
    } catch (err) {
      console.warn("Error cargando solicitudes:", err);
    } finally {
      setCargandoSolicitudes(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      cargarSolicitudesCliente();
    }
  }, [user]);

  const handleEnviarSolicitudCliente = async () => {
    if (!solicitudEntrada || !solicitudSalida) {
      mostrarNotifCliente(
        "Por favor selecciona las fechas de entrada y salida.",
      );
      return;
    }
    if (solicitudEntrada > solicitudSalida) {
      mostrarNotifCliente(
        "La fecha de entrada no puede ser mayor a la fecha de salida.",
      );
      return;
    }

    setEnviandoSolicitud(true);
    try {
      const payload: any = {
        nombre: user?.nombre || "Cliente Web",
        telefono: user?.telefono || "Sin teléfono",
        email: user?.email || null,
        ambiente_codigo: habitacionSeleccionada || "Habitación 101",
        fecha_entrada: solicitudEntrada,
        fecha_salida: solicitudSalida,
        personas: Number(solicitudPersonas) || 1,
        estado: "pendiente",
      };

      if (
        user?.id &&
        typeof user.id === "string" &&
        user.id.includes("-") &&
        user.id.length > 30
      ) {
        payload.cliente_id = user.id;
      }

      const { error } = await supabase
        .from("solicitudes_reserva")
        .insert(payload);

      if (error) {
        if (payload.cliente_id) {
          delete payload.cliente_id;
          const { error: err2 } = await supabase
            .from("solicitudes_reserva")
            .insert(payload);
          if (err2) throw err2;
        } else {
          throw error;
        }
      }

      setShowModalSolicitudCliente(false);
      cargarSolicitudesCliente();
      mostrarNotifCliente(
        "✓ Recibimos tu solicitud. El hotel revisará la disponibilidad y te confirmará.",
      );
      setCartOpen(true);
    } catch (e: any) {
      mostrarNotifCliente(
        "Error enviando solicitud: " + (e.message || "Error"),
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const handleConfirmarAsignacionCine = async () => {
    if (!solicitudActualParaHabitacion || !habitacionElegidaCine) {
      mostrarNotifCliente("Por favor selecciona una habitación en el mapa.");
      return;
    }

    setGuardandoHabitacion(true);
    try {
      const { error } = await supabase
        .from("solicitudes_reserva")
        .update({ ambiente_codigo: habitacionElegidaCine })
        .eq("id", solicitudActualParaHabitacion.id);

      if (error) throw error;

      mostrarNotifCliente(
        `✓ Habitación ${habitacionElegidaCine} seleccionada con éxito para tu estadía.`,
      );
      setModalSelectorCineOpen(false);
      cargarSolicitudesCliente();
    } catch (err: any) {
      mostrarNotifCliente(
        "Error guardando habitación: " + (err.message || "Error"),
      );
    } finally {
      setGuardandoHabitacion(false);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const habitaciones = [
    {
      nombre: "Simple",
      tipoBadge: "Habitación Simple",
      capacidad: "1 persona",
      img: "/habitacion-simple.jpg",
      desc: "Ideal para viajes de trabajo o estadías cortas.",
      bullets: ["Cama individual", "Baño privado", "Wi-Fi y TV"],
    },
    {
      nombre: "Matrimonial",
      tipoBadge: "Matrimonial",
      capacidad: "2 personas",
      img: "/habitacion-matrimonial.jpg",
      desc: "Una cama amplia y un ambiente para descansar bien.",
      bullets: ["Cama matrimonial", "Baño privado", "Wi-Fi y TV"],
    },
    {
      nombre: "Doble",
      tipoBadge: "Habitación doble",
      capacidad: "2 a 3 personas",
      img: "/habitacion-doble.jpg",
      desc: "Dos camas para amigos, colegas o familia.",
      bullets: ["Dos camas", "Baño privado", "Escritorio"],
    },
    {
      nombre: "Familiar",
      tipoBadge: "Habitación Familiar",
      capacidad: "4 personas",
      img: "/habitacion-familiar.jpg",
      desc: "Más espacio para compartir en familia.",
      bullets: ["Camas combinadas", "Sala pequeña", "Baño amplio"],
    },
  ];

  const fotosGaleria = [
    { src: "/recepcion-lobby.jpg", titulo: "Recepción y lobby" },
    { src: "/desayuno.jpg", titulo: "Desayuno incluido" },
    { src: "/terraza.jpg", titulo: "Terraza del hotel" },
    { src: "/salon.jpg", titulo: "Comedor y eventos" },
  ];

  return (
    <div className="min-h-screen text-[#F5EBDC] bg-[#1E140C] selection:bg-[#E0A526] selection:text-[#1E140C]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#1E140C]/95 backdrop-blur-md border-b border-[#3D2817]">
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3.5 cursor-pointer py-2"
            onClick={() => scrollTo("hero")}
          >
            <div className="w-11 h-11 rounded-full bg-white p-1 flex items-center justify-center shadow-md overflow-hidden border border-[#E0A526]">
              <img
                src="/logo.png"
                alt="Hotel Asiri"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-2xl font-normal tracking-wide text-[#F5EBDC]"
              style={{ fontFamily: '"Young Serif", Georgia, serif' }}
            >
              Hotel Asiri
            </span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-7 text-sm font-medium text-[#C9B096]">
            <button
              onClick={() => scrollTo("habitaciones")}
              className="hover:text-[#E0A526] transition-colors py-1 cursor-pointer"
            >
              Habitaciones
            </button>
            <button
              onClick={() => scrollTo("servicios")}
              className="hover:text-[#E0A526] transition-colors py-1 cursor-pointer"
            >
              Servicios
            </button>
            <button
              onClick={() => scrollTo("horarios")}
              className="hover:text-[#E0A526] transition-colors py-1 cursor-pointer"
            >
              Horarios
            </button>
            <button
              onClick={() => scrollTo("galeria")}
              className="hover:text-[#E0A526] transition-colors py-1 cursor-pointer"
            >
              Galería
            </button>
            <button
              onClick={() => scrollTo("contacto")}
              className="hover:text-[#E0A526] transition-colors py-1 cursor-pointer"
            >
              Contacto
            </button>

            {/* CARRITO DE RESERVAS PARA EL CLIENTE */}
            {user && user.rol === "cliente" && (
              <button
                onClick={() => {
                  cargarSolicitudesCliente();
                  setCartOpen(true);
                }}
                className="relative p-2.5 rounded-full bg-[#2D1E12] border border-[#5A3418] hover:border-[#E0A526] text-[#E0A526] transition-all cursor-pointer"
                title="Ver mis solicitudes y reservas"
              >
                <ShoppingCart className="w-5 h-5" />
                {misSolicitudes.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#E0A526] text-[#1E140C] font-extrabold text-[11px] flex items-center justify-center shadow-lg">
                    {misSolicitudes.length}
                  </span>
                )}
              </button>
            )}

            {/* USUARIO O BOTÓN INICIAR SESIÓN */}
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D1E12] border border-[#5A3418] text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#E0A526] text-[#1E140C] font-bold flex items-center justify-center text-xs">
                    {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="text-white font-semibold">
                    {user.nombre}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs text-[#C9B096] hover:text-[#E0A526] font-semibold cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#E0A526] text-[#1E140C] font-semibold text-sm hover:bg-[#F28C38] transition-all shadow-[0_0_20px_rgba(224,165,38,0.35)] flex items-center gap-2 cursor-pointer ml-2"
              >
                <span>Iniciar sesión</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative pt-12 pb-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 85% 30%, rgba(224, 165, 38, 0.25) 0%, transparent 60%), radial-gradient(ellipse at 15% 70%, rgba(242, 140, 56, 0.20) 0%, transparent 60%), linear-gradient(180deg, #2A1A0E 0%, #362012 50%, #1E140C 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 pb-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="w-20 h-20 rounded-full bg-white p-2 flex items-center justify-center shadow-2xl overflow-hidden border-2 border-[#E0A526]">
              <img
                src="/logo.png"
                alt="Hotel Asiri"
                className="w-full h-full object-contain"
              />
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight text-[#F5EBDC]"
              style={{ fontFamily: '"Young Serif", Georgia, serif' }}
            >
              Asiri: una sonrisa en el corazón de Tarija
            </h1>

            <p className="text-[#C9B096] text-base sm:text-lg max-w-xl leading-relaxed">
              Asiri significa ‘sonrisa’ en quechua, y es justo lo que buscamos
              darte: habitaciones cómodas, atención cercana y todo lo necesario
              para una estadía tranquila
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => scrollTo("habitaciones")}
                className="px-8 py-3 rounded-full bg-[#E0A526] text-[#1E140C] font-semibold text-sm hover:bg-[#F28C38] transition-all shadow-[0_0_20px_rgba(224,165,38,0.35)] cursor-pointer"
              >
                Ver habitaciones
              </button>
              <button
                onClick={() => scrollTo("servicios")}
                className="px-8 py-3 rounded-full border border-[#F5EBDC]/40 text-[#F5EBDC] font-semibold text-sm hover:bg-[#F5EBDC]/10 transition-colors cursor-pointer"
              >
                Conocer servicios
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#E0A526]/40 to-[#F28C38]/30 rounded-3xl blur-xl opacity-80 group-hover:opacity-100 transition duration-500" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#E0A526] bg-[#2D1E12] shadow-2xl p-2.5">
                <div className="relative h-96 w-full rounded-xl overflow-hidden">
                  <img
                    src="/hotel.jpg"
                    alt="Hotel Asiri Tarija"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/bienvenida.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E140C]/90 via-transparent to-transparent" />

                  <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-3 px-2">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#E0A526] overflow-hidden shadow-xl bg-[#1E140C] shrink-0">
                      <img
                        src="/habitacion-matrimonial.jpg"
                        alt="Habitación"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full border-2 border-[#E0A526] overflow-hidden shadow-2xl bg-[#1E140C] transform -translate-y-2 shrink-0">
                      <img
                        src="/recepcion-lobby.jpg"
                        alt="Lobby"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#E0A526] overflow-hidden shadow-xl bg-[#1E140C] shrink-0">
                      <img
                        src="/terraza.jpg"
                        alt="Terraza"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SILUETA DE MONTAÑAS */}
        <div className="relative w-full overflow-hidden leading-none block p-0 m-0 pointer-events-none select-none -mb-[1px]">
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block m-0 p-0"
            preserveAspectRatio="none"
          >
            <circle
              cx="160"
              cy="110"
              r="100"
              fill="url(#sun-gradient)"
              opacity="0.65"
            />
            <path
              d="M0 140 L160 80 L320 120 L520 60 L740 110 L960 50 L1180 100 L1340 70 L1440 110 L1440 180 L0 180 Z"
              fill="#2A1B10"
              opacity="0.6"
            />
            <path
              d="M0 150 L200 95 L400 135 L620 75 L820 125 L1040 80 L1260 130 L1440 100 L1440 180 L0 180 Z"
              fill="#23160D"
              opacity="0.9"
            />
            <path
              d="M0 165 L240 120 L480 155 L720 105 L980 150 L1200 115 L1440 145 L1440 180 L0 180 Z"
              fill="#26170D"
            />
            <defs>
              <radialGradient id="sun-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E0A526" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#F28C38" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E140C" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* HORARIOS: Con id="horarios" para vincular con el Navbar */}
      <section
        id="horarios"
        className="bg-[#26170D] border-y border-[#3D2817] py-4 m-0 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs text-[#C9B096]">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[#E0A526]" />
            <span>
              <strong>Recepción:</strong> 8:30 a 18:00
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Coffee className="w-4 h-4 text-[#E0A526]" />
            <span>
              <strong>Desayuno Buffet:</strong> 6:30 a 11:00
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-[#E0A526]" />
            <span>
              <strong>Entrada:</strong> 8:30 - 12:00 | <strong>Salida:</strong>{" "}
              11:00
            </span>
          </div>
        </div>
      </section>

      {/* HABITACIONES */}
      <section
        id="habitaciones"
        className="py-24 px-5 relative"
        style={{
          background:
            "linear-gradient(180deg, #1E140C 0%, #2A170B 20%, #3E2412 45%, #6E4221 70%, #A66E3B 85%, #D6BF9F 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="inline-block py-1 px-4 mb-3 rounded-full bg-[#E0A526]/20 border border-[#E0A526]/40 text-[#E0A526] text-xs font-bold tracking-widest uppercase">
              Alojamiento
            </span>
            <h2
              className="text-4xl md:text-5xl font-normal text-[#F5EBDC]"
              style={{ fontFamily: '"Young Serif", Georgia, serif' }}
            >
              Habitaciones
            </h2>
            <div className="w-16 h-1 bg-[#E0A526] rounded-full mt-2 mb-3" />
            <p className="text-[#C9B096] text-sm max-w-xl">
              Elige el espacio que mejor se ajusta a tu viaje, solo o
              acompañado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {habitaciones.map((room, i) => (
              <div
                key={i}
                className="bg-[#24170E] border border-[#3D2817] rounded-3xl overflow-hidden hover:border-[#E0A526]/70 transition-all flex flex-col justify-between group shadow-2xl"
              >
                <div className="bg-white rounded-2xl m-3 p-2.5 flex items-stretch gap-2 shadow-sm text-neutral-800">
                  <div className="w-20 flex flex-col justify-between py-1 text-center shrink-0 border-r border-neutral-100 pr-1 space-y-2">
                    <div className="flex flex-col items-center">
                      <BedIcon className="w-4 h-4 text-neutral-700" />
                      <span className="text-[8px] font-medium leading-tight text-neutral-600 mt-0.5">
                        {room.tipoBadge}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Tv className="w-4 h-4 text-neutral-700" />
                      <span className="text-[8px] font-medium leading-tight text-neutral-600 mt-0.5">
                        TV Smart
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <ShowerIcon className="w-4 h-4 text-neutral-700" />
                      <span className="text-[8px] font-medium leading-tight text-neutral-600 mt-0.5">
                        Baño privado
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Wind className="w-4 h-4 text-neutral-700" />
                      <span className="text-[8px] font-medium leading-tight text-neutral-600 mt-0.5">
                        Aire acond.
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 rounded-xl overflow-hidden min-h-[150px] bg-neutral-100">
                    <img
                      src={room.img}
                      alt={room.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/hotel.jpg";
                      }}
                    />
                  </div>
                </div>

                <div className="px-5 pb-6 pt-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-2xl font-normal text-[#F5EBDC] mb-2"
                      style={{ fontFamily: '"Young Serif", Georgia, serif' }}
                    >
                      {room.nombre}
                    </h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E0A526] text-[#1E140C] text-xs font-bold mb-3 shadow-sm">
                      Capacidad: {room.capacidad}
                    </span>
                    <p className="text-xs text-[#C9B096] mb-4 leading-relaxed">
                      {room.desc}
                    </p>
                    <ul className="text-xs text-[#E6D5BC] space-y-1.5 mb-5">
                      {room.bullets.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E0A526]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthModalOpen(true);
                      } else {
                        setHabitacionSeleccionada(`Habitación ${room.nombre}`);
                        setShowModalSolicitudCliente(true);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#E0A526] text-[#1E140C] font-bold text-xs hover:bg-[#F28C38] transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Solicitar reserva</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-[#E0A526] text-xs font-bold tracking-widest uppercase">
            Comodidades
          </span>
          <h2
            className="text-3xl sm:text-4xl font-normal mt-2 text-[#F5EBDC]"
            style={{ fontFamily: '"Young Serif", Georgia, serif' }}
          >
            Servicios pensados para tu confort
          </h2>
          <div className="w-16 h-1 bg-[#E0A526] rounded-full mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#24170E] border border-[#3D2817] p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#E0A526]/10 border border-[#E0A526]/30 flex items-center justify-center mb-4 text-[#E0A526]">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5EBDC] mb-2 font-serif">
              Desayuno buffet
            </h3>
            <p className="text-xs text-[#C9B096] leading-relaxed">
              Comienza tus mañanas en Tarija con café fresco, panadería local y
              jugos variados de 6:30 a 11:00.
            </p>
          </div>

          <div className="bg-[#24170E] border border-[#3D2817] p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#E0A526]/10 border border-[#E0A526]/30 flex items-center justify-center mb-4 text-[#E0A526]">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5EBDC] mb-2 font-serif">
              Estacionamiento
            </h3>
            <p className="text-xs text-[#C9B096] leading-relaxed">
              Contamos con cochera segura para tu vehículo durante toda tu
              estadía.
            </p>
          </div>

          <div className="bg-[#24170E] border border-[#3D2817] p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#E0A526]/10 border border-[#E0A526]/30 flex items-center justify-center mb-4 text-[#E0A526]">
              <UtensilsIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5EBDC] mb-2 font-serif">
              Salón de eventos & Coworking
            </h3>
            <p className="text-xs text-[#C9B096] leading-relaxed">
              Espacio climatizado disponible para reuniones, trabajo
              colaborativo y celebraciones.
            </p>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section
        id="galeria"
        className="py-20 bg-[#24170E]/60 border-y border-[#3D2817]"
      >
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-normal text-[#F5EBDC]"
              style={{ fontFamily: '"Young Serif", Georgia, serif' }}
            >
              Galería del Hotel
            </h2>
            <div className="w-16 h-1 bg-[#E0A526] rounded-full mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fotosGaleria.map((foto, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl overflow-hidden border border-[#3D2817] group shadow-lg"
              >
                <img
                  src={foto.src}
                  alt={foto.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/hotel.jpg";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO CON MAPA / CROQUIS DE GOOGLE MAPS */}
      <section id="contacto" className="py-20 max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            {/* BADGE MODIFICADO A "Contacto" */}
            <span className="text-[#E0A526] text-xs font-bold tracking-widest uppercase">
              Contacto
            </span>
            <h2
              className="text-3xl sm:text-4xl font-normal mt-2 mb-4 text-[#F5EBDC]"
              style={{ fontFamily: '"Young Serif", Georgia, serif' }}
            >
              Encuéntranos en Tarija
            </h2>
            <p className="text-[#C9B096] mb-8 text-sm leading-relaxed">
              El Hotel Asiri se ubica estratégicamente cerca de las principales
              zonas comerciales y turísticas de la ciudad de Tarija.
            </p>

            <div className="space-y-4 text-sm text-[#F5EBDC]">
              <a
                href="https://share.google/r2dfqJUeBvul3JyCY"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-[#E0A526] transition-colors group cursor-pointer"
              >
                <MapPin className="w-5 h-5 text-[#E0A526] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="underline decoration-[#E0A526]/40 underline-offset-4">
                  Calle Domingo Paz N.º 663, Tarija - Bolivia
                </span>
              </a>

              <a
                href="https://www.whatsapp.com/catalog/59168705002/?app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-[#E0A526] transition-colors group cursor-pointer"
              >
                <Phone className="w-5 h-5 text-[#E0A526] shrink-0 group-hover:scale-110 transition-transform" />
                <span>
                  <strong className="text-[#E0A526] font-semibold">
                    Contacto recepcionista:
                  </strong>{" "}
                  (591) 68705002{" "}
                  <span className="text-xs text-[#25D366] font-semibold ml-1">
                    (WhatsApp)
                  </span>
                </span>
              </a>

              <a
                href="mailto:hotelasiritarijabolivia@gmail.com"
                className="flex items-center gap-3 hover:text-[#E0A526] transition-colors group cursor-pointer"
              >
                <Mail className="w-5 h-5 text-[#E0A526] shrink-0 group-hover:scale-110 transition-transform" />
                <span>hotelasiritarijabolivia@gmail.com</span>
              </a>
            </div>
          </div>

          {/* CROQUIS DE GOOGLE MAPS */}
          <div className="relative w-full group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#E0A526]/30 to-[#F28C38]/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#E0A526] bg-[#24170E] shadow-2xl p-2.5">
              <a
                href="https://share.google/r2dfqJUeBvul3JyCY"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-xl overflow-hidden cursor-pointer group/map"
              >
                <iframe
                  title="Ubicación Hotel Asiri"
                  src="https://www.google.com/maps?q=-21.5323,-64.7339&hl=es&z=17&output=embed"
                  className="w-full h-[380px] rounded-xl border-0 pointer-events-none filter contrast-125 brightness-95"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-between p-4 group-hover/map:bg-black/20 transition-colors">
                  <div className="self-end bg-[#1E140C]/90 border border-[#E0A526] px-3.5 py-1.5 rounded-full text-xs text-[#E0A526] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ver en Google Maps</span>
                  </div>
                  <div className="bg-[#1E140C]/95 border border-[#3D2817] p-3.5 rounded-xl text-left backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="text-[#E0A526]">●</span> Hotel Asiri
                      Tarija
                    </div>
                    <p className="text-xs text-[#C9B096] mt-0.5">
                      Calle Domingo Paz N.º 663 · A pasos de la plaza principal
                    </p>
                    <span className="inline-block mt-2 text-[11px] text-[#E0A526] font-semibold underline">
                      Toca aquí para abrir la ruta en Google Maps ↗
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#190F08] border-t border-[#3D2817] pt-14 pb-8 text-xs text-[#C9B096]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden border border-[#E0A526]">
                  <img
                    src="/logo.png"
                    alt="Hotel Asiri"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-serif text-lg text-[#F5EBDC]">
                  Hotel Asiri
                </span>
              </div>
              <p className="text-xs text-[#C9B096] leading-relaxed">
                El hotel que te recibe sonriendo. Habitaciones cómodas y
                atención cercana en Tarija.
              </p>
            </div>

            <div>
              <h4 className="text-[#E0A526] font-bold text-xs uppercase tracking-wider mb-3">
                NAVEGACIÓN
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => scrollTo("hero")}
                    className="hover:text-white cursor-pointer"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("habitaciones")}
                    className="hover:text-white cursor-pointer"
                  >
                    Habitaciones
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("servicios")}
                    className="hover:text-white cursor-pointer"
                  >
                    Servicios
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("horarios")}
                    className="hover:text-white cursor-pointer"
                  >
                    Horarios
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("galeria")}
                    className="hover:text-white cursor-pointer"
                  >
                    Galería
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("contacto")}
                    className="hover:text-white cursor-pointer"
                  >
                    Contacto
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#E0A526] font-bold text-xs uppercase tracking-wider mb-3">
                ATENCIÓN
              </h4>
              <ul className="space-y-2 text-xs">
                <li>Recepción: 8:30 a 18:00</li>
                <li>Check-in: 8:30 a 12:00</li>
                <li>Desayuno Buffet: 6:30 a 11:00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#3D2817]/60 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#F5EBDC] tracking-wider">
                ASIRI HOTEL
              </h3>
              <p className="text-xs italic text-[#C9B096] mt-1">
                ¡Un nuevo concepto del descanso!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <a
                href="https://www.facebook.com/HotelAsiri/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#F5EBDC] hover:text-[#E0A526] transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#1877F2] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                </div>
                <span className="font-medium">Facebook</span>
              </a>

              <a
                href="https://www.whatsapp.com/catalog/59168705002/?app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#F5EBDC] hover:text-[#E0A526] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#190F08] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span>Contacto recepcionista: (591) 68705002</span>
              </a>

              <a
                href="https://www.instagram.com/hotel_asiri_tja/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-[#F5EBDC] hover:text-[#E0A526] transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#E4405F] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <InstagramIcon className="w-4 h-4 text-[#E4405F]" />
                </div>
                <span className="font-medium">Hotel Asiri</span>
              </a>
            </div>
          </div>

          <div className="border-t border-[#3D2817]/60 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#C9B096]/60 gap-3">
            <span>© 2026 Hotel Asiri. Todos los derechos reservados.</span>
            <span>Sistema de Gestión Hotelera · Tarija, Bolivia</span>
          </div>
        </div>
      </footer>

      {/* PANEL LATERAL / DRAWER DEL CARRITO DE RESERVAS */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#24170E] border-l border-[#5A3418] h-full flex flex-col shadow-2xl text-[#F5EBDC] p-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#3D2817] pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-[#E0A526]" />
                <h3 className="text-xl font-bold font-serif text-[#F5EBDC]">
                  Mis Solicitudes y Reservas
                </h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 rounded-lg text-[#C9B096] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {cargandoSolicitudes ? (
                <div className="text-center py-10 text-xs text-[#C9B096]">
                  Cargando tus solicitudes...
                </div>
              ) : misSolicitudes.length === 0 ? (
                <div className="text-center py-12 text-[#C9B096] space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#1E140C] border border-[#3D2817] flex items-center justify-center text-[#E0A526]">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold">
                    No tienes solicitudes activas
                  </p>
                  <p className="text-xs">
                    Elige una habitación y envía una solicitud para iniciar tu
                    estadía.
                  </p>
                </div>
              ) : (
                misSolicitudes.map((sol) => (
                  <div
                    key={sol.id}
                    className="p-4 rounded-2xl bg-[#1E140C] border border-[#3D2817] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#E0A526] text-sm">
                        {sol.ambiente_codigo}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sol.estado === "confirmada"
                            ? "bg-emerald-950/80 border border-emerald-600 text-emerald-400"
                            : sol.estado === "cancelada"
                              ? "bg-rose-950/80 border border-rose-600 text-rose-400"
                              : "bg-amber-950/80 border border-amber-600 text-amber-300"
                        }`}
                      >
                        {sol.estado}
                      </span>
                    </div>

                    <div className="text-xs text-[#C9B096] space-y-1">
                      <p>
                        <strong>Entrada:</strong> {sol.fecha_entrada} |{" "}
                        <strong>Salida:</strong> {sol.fecha_salida}
                      </p>
                      <p>
                        <strong>Personas:</strong> {sol.personas}
                      </p>
                    </div>

                    {/* SI ESTÁ CONFIRMADA, BOTÓN PARA ELEGIR HABITACIÓN TIPO CINE */}
                    {sol.estado === "confirmada" && (
                      <button
                        onClick={() => {
                          setSolicitudActualParaHabitacion(sol);
                          setHabitacionElegidaCine(sol.ambiente_codigo);
                          setModalSelectorCineOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#E0A526] to-[#F28C38] text-[#1E140C] font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span> Haz clic para seleccionar tu habitación</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#3D2817]">
              <button
                onClick={() => setCartOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#2D1E12] border border-[#5A3418] text-[#C9B096] hover:text-white font-semibold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PLANO DE HOTEL / SELECTOR TIPO CINE FILTRADO */}
      {modalSelectorCineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 sm:p-7 text-[#F5EBDC] space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {(() => {
              // Detección estricta del tipo de habitación que reservó el cliente
              const tipoReservaStr = (
                solicitudActualParaHabitacion?.ambiente_codigo || ""
              ).toLowerCase();
              let tipoFiltro = "";
              if (tipoReservaStr.includes("simple")) tipoFiltro = "simple";
              else if (tipoReservaStr.includes("doble")) tipoFiltro = "doble";
              else if (tipoReservaStr.includes("matrimonial"))
                tipoFiltro = "matrimonial";
              else if (tipoReservaStr.includes("familiar"))
                tipoFiltro = "familiar";

              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#3D2817] pb-3">
                    <div>
                      <h3 className="font-serif text-2xl text-[#E0A526]">
                        Selecciona tu Habitación
                      </h3>
                      <p className="text-xs text-[#C9B096] mt-0.5">
                        Reserva confirmada:{" "}
                        <strong className="text-white capitalize">
                          {solicitudActualParaHabitacion?.ambiente_codigo}
                        </strong>{" "}
                        · Solo están habilitadas las habitaciones que
                        corresponden a tu reserva.
                      </p>
                    </div>
                    <button
                      onClick={() => setModalSelectorCineOpen(false)}
                      className="w-8 h-8 rounded-full bg-[#1E140C] border border-[#3D2817] text-[#C9B096] hover:text-white flex items-center justify-center text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Referencias tipo cine sin emojis */}
                  <div className="flex flex-wrap items-center justify-center gap-5 text-xs py-2.5 bg-[#1E140C] rounded-2xl border border-[#3D2817]">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-400" />
                      <span className="text-[#C9B096]">
                        Habilitada{" "}
                        {tipoFiltro ? `(${tipoFiltro.toUpperCase()})` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-md bg-[#E0A526] border-2 border-white shadow-sm" />
                      <span className="text-[#F5EBDC] font-bold">
                        Tu Selección
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-md bg-stone-900 border border-stone-800 opacity-40" />
                      <span className="text-stone-500">
                        Otro tipo / Bloqueada
                      </span>
                    </div>
                  </div>

                  {/* Distribución por pisos */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((piso) => (
                      <div
                        key={piso}
                        className="p-3.5 rounded-2xl bg-[#1E140C] border border-[#3D2817]"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0A526] mb-3 flex items-center justify-between">
                          <span>Piso {piso}</span>
                          <span className="text-[10px] text-[#C9B096] font-normal">
                            Hotel Asiri
                          </span>
                        </h4>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                          {AMBIENTES_HOTEL.filter((a) => a.piso === piso).map(
                            (amb) => {
                              const ambTipoNorm = amb.tipo.toLowerCase();
                              // SOLO HABILITAR SI COINCIDE CON LA RESERVA DEL CLIENTE (Simple solo simples, Doble solo dobles, etc.)
                              const esElegible =
                                !tipoFiltro || ambTipoNorm.includes(tipoFiltro);
                              const esSeleccionado =
                                habitacionElegidaCine === amb.codigo;

                              if (!esElegible) {
                                return (
                                  <button
                                    key={amb.codigo}
                                    type="button"
                                    disabled={true}
                                    className="p-2.5 rounded-xl border border-stone-800 bg-stone-950/40 text-stone-600 opacity-30 cursor-not-allowed flex flex-col items-center justify-center"
                                    title={`Esta habitación es ${amb.tipo}. Tu reserva es de tipo ${tipoFiltro}.`}
                                  >
                                    <span className="text-xs font-bold">
                                      {amb.codigo}
                                    </span>
                                    <span className="text-[9px] mt-0.5">
                                      {amb.tipo}
                                    </span>
                                    <span className="text-[8px] mt-0.5 text-stone-600">
                                      No aplica
                                    </span>
                                  </button>
                                );
                              }

                              return (
                                <button
                                  key={amb.codigo}
                                  type="button"
                                  onClick={() =>
                                    setHabitacionElegidaCine(amb.codigo)
                                  }
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    esSeleccionado
                                      ? "bg-[#E0A526] text-[#1E140C] border-white font-black shadow-[0_0_15px_rgba(224,165,38,0.6)] transform scale-105"
                                      : "bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:border-emerald-500 hover:scale-[1.02]"
                                  }`}
                                >
                                  <span className="text-xs font-bold">
                                    {amb.codigo}
                                  </span>
                                  <span className="text-[9px] mt-0.5 opacity-90">
                                    {amb.tipo}
                                  </span>
                                  <span className="text-[8px] mt-0.5">
                                    Bs {amb.precio}
                                  </span>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {habitacionElegidaCine && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#E0A526] shrink-0" />
                      <span>
                        Habitación seleccionada:{" "}
                        <strong>{habitacionElegidaCine}</strong> (Se notificará
                        al Administrador)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3D2817]">
                    <button
                      onClick={() => setModalSelectorCineOpen(false)}
                      disabled={guardandoHabitacion}
                      className="px-5 py-2.5 rounded-xl bg-[#2D1E12] text-xs font-semibold text-[#C9B096] hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmarAsignacionCine}
                      disabled={guardandoHabitacion || !habitacionElegidaCine}
                      className="px-6 py-2.5 rounded-xl bg-[#E0A526] text-[#1E140C] font-bold text-xs hover:bg-[#F28C38] transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {guardandoHabitacion
                        ? "Guardando..."
                        : "Confirmar Mi Habitación"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL CONTROLADO */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(user: any) => {
            setAuthModalOpen(false);
            onLoginSuccess?.(user);
          }}
          onLogin={(user: any) => {
            setAuthModalOpen(false);
            onLoginSuccess?.(user);
          }}
        />
      )}

      {/* NOTIFICACIÓN FLOTANTE */}
      {notifCliente && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#24170E] border-2 border-[#E0A526] text-[#F5EBDC] px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-3">
          <span>{notifCliente}</span>
        </div>
      )}

      {/* MODAL SOLICITUD DE RESERVA PARA CLIENTES */}
      {showModalSolicitudCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#24170E] border border-[#5A3418] rounded-3xl p-6 text-[#F5EBDC] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3D2817] pb-3">
              <h3 className="font-['Young_Serif',serif] text-2xl text-[#E0A526]">
                Solicitud de Reserva
              </h3>
              <button
                onClick={() => setShowModalSolicitudCliente(false)}
                className="w-8 h-8 rounded-full bg-[#1E140C] border border-[#3D2817] text-[#C9B096] hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">
                  Habitación solicitada
                </label>
                <input
                  type="text"
                  readOnly
                  value={habitacionSeleccionada}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#E0A526] font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#C9B096] mb-1 font-semibold">
                    Huésped
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={user?.nombre || ""}
                    className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#F5EBDC] outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[#C9B096] mb-1 font-semibold">
                    Teléfono de contacto
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={user?.telefono || "Registrado en cuenta"}
                    className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#F5EBDC] outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || ""}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-[#C9B096] outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#C9B096] mb-1 font-semibold">
                    Fecha de Entrada *
                  </label>
                  <input
                    type="date"
                    value={solicitudEntrada}
                    onChange={(e) => setSolicitudEntrada(e.target.value)}
                    className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#E0A526]"
                  />
                </div>
                <div>
                  <label className="block text-[#C9B096] mb-1 font-semibold">
                    Fecha de Salida *
                  </label>
                  <input
                    type="date"
                    value={solicitudSalida}
                    onChange={(e) => setSolicitudSalida(e.target.value)}
                    className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#E0A526]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#C9B096] mb-1 font-semibold">
                  Cantidad de personas
                </label>
                <select
                  value={solicitudPersonas}
                  onChange={(e) => setSolicitudPersonas(Number(e.target.value))}
                  className="w-full bg-[#1E140C] border border-[#3D2817] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value={1}>1 persona</option>
                  <option value={2}>2 personas</option>
                  <option value={3}>3 personas</option>
                  <option value={4}>4 personas</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#1E140C] border border-[#3D2817] text-[11px] text-[#C9B096] leading-relaxed">
                ℹ️ <strong>Información:</strong> Esta solicitud será revisada
                por el hotel. Una vez confirmada, podrás seleccionar tu piso y
                número de habitación directamente desde tu carrito.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3D2817]">
              <button
                onClick={() => setShowModalSolicitudCliente(false)}
                disabled={enviandoSolicitud}
                className="px-4 py-2 rounded-xl bg-[#2D1E12] text-xs font-semibold text-[#C9B096] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarSolicitudCliente}
                disabled={enviandoSolicitud}
                className={`px-5 py-2 rounded-xl text-[#1E140C] font-bold text-xs shadow transition-all ${
                  enviandoSolicitud
                    ? "bg-[#A87B1D] opacity-60 cursor-not-allowed"
                    : "bg-[#E0A526] hover:bg-[#F28C38] cursor-pointer"
                }`}
              >
                {enviandoSolicitud ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
