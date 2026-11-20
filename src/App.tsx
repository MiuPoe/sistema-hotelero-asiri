import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import HomePage from './pages/HomePage';
import AdminDashboard from './components/AdminDashboard';
import LimpiezaDashboard from './components/LimpiezaDashboard';

export interface UserSession {
  id: string;
  email: string;
  rol: 'administrador' | 'recepcionista' | 'limpieza' | 'cliente';
  nombre?: string;
  telefono?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [cargando, setCargando] = useState(true);

  // Obtener perfil completo y rol real desde Supabase
  const obtenerPerfil = async (authUserId: string, authEmail: string) => {
    try {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (perfil && perfil.activo === false) {
        await supabase.auth.signOut();
        setCurrentUser(null);
        alert('Tu cuenta ha sido desactivada. Comunícate con administración.');
        return;
      }

      setCurrentUser({
        id: authUserId,
        email: authEmail,
        rol: perfil?.rol || 'cliente',
        nombre: perfil?.nombre || authEmail.split('@')[0],
        telefono: perfil?.telefono || ''
      });
    } catch (e) {
      console.error('Error cargando perfil:', e);
      setCurrentUser({
        id: authUserId,
        email: authEmail,
        rol: 'cliente',
        nombre: authEmail.split('@')[0]
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // 1. Sesión actual al abrir la web
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        obtenerPerfil(session.user.id, session.user.email || '');
      } else {
        setCargando(false);
      }
    });

    // 2. Escuchar cambios de login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        obtenerPerfil(session.user.id, session.user.email || '');
      } else {
        setCurrentUser(null);
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#1E140C] flex items-center justify-center text-[#E0A526] font-['Young_Serif',serif] text-xl">
        Cargando Hotel Asiri...
      </div>
    );
  }

  // 1. PANEL ADMINISTRADOR Y RECEPCIONISTA (Comparten AdminDashboard con condicionales)
  if (currentUser && (currentUser.rol === 'administrador' || currentUser.rol === 'recepcionista')) {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // 2. PANEL LIMPIEZA (Pantalla exclusiva para personal de limpieza)
  if (currentUser && currentUser.rol === 'limpieza') {
    return <LimpiezaDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // 3. PÁGINA WEB PÚBLICA (Para clientes logueados y visitantes)
  return (
    <HomePage 
      user={currentUser} 
      onLogout={handleLogout} 
      onLoginSuccess={(u) => obtenerPerfil(u.id, u.email)} 
    />
  );
}