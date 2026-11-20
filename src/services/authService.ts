import { supabase } from '../lib/supabase'

export interface PerfilUsuario {
  id: string
  nombre: string
  email: string
  telefono?: string
  rol: 'administrador' | 'recepcionista' | 'limpieza' | 'cliente'
  activo: boolean
}

export const authService = {
  // Iniciar sesión con email y contraseña
  async iniciarSesion(email: string, password: string): Promise<{ user: PerfilUsuario | null; error: string | null }> {
    const emailLimpio = email.trim().toLowerCase()
    
    // 1. Verificación oficial de contraseña en Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLimpio,
      password
    })

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { user: null, error: 'Tu correo aún no ha sido confirmado. Por favor revisa tu bandeja de entrada y haz clic en el enlace antes de ingresar.' }
      }
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'No se pudo obtener la sesión de usuario.' }
    }

    const emailLimpioCheck = emailLimpio
    const esTamara = emailLimpioCheck.includes('tamfranco') || emailLimpioCheck.includes('tamfrango')
    const esLeonel = emailLimpioCheck.includes('leonel')
    const esGrimanez = emailLimpioCheck.includes('grim')

    // Si no es empleado interno y el correo no está confirmado en Supabase, bloqueamos el ingreso
    if (!data.user.confirmed_at && !esTamara && !esLeonel && !esGrimanez) {
      await supabase.auth.signOut()
      return { user: null, error: 'Debes confirmar tu correo electrónico antes de ingresar. Por favor revisa tu bandeja de entrada.' }
    }

    let usuarioFinal: PerfilUsuario = {
      id: data.user.id,
      nombre: esTamara ? 'Tamara Franco' : (esLeonel ? 'Leonel Armin Mayta' : (esGrimanez ? 'Grimanez Cordero' : (data.user.user_metadata?.nombre || 'Usuario'))),
      email: emailLimpio,
      telefono: data.user.user_metadata?.telefono,
      rol: esTamara ? 'administrador' : (esLeonel ? 'recepcionista' : (esGrimanez ? 'limpieza' : 'cliente')),
      activo: true
    }

    // 3. Intentamos leer la tabla perfiles
    try {
      const perfilData = await this.getPerfilPorId(data.user.id)
      if (perfilData) {
        usuarioFinal = perfilData
      }
    } catch {
      // Si la API da 404, usuarioFinal ya tiene los datos correctos asegurados
    }

    return { user: usuarioFinal, error: null }
  },

  // Registrar cliente
  async registrarse(email: string, password: string, nombre: string, telefono: string): Promise<{ user: PerfilUsuario | null; error: string | null; requiereConfirmacion?: boolean }> {
    const emailLimpio = email.trim().toLowerCase()

    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined

    const { data, error } = await supabase.auth.signUp({
      email: emailLimpio,
      password,
      options: {
        data: {
          nombre: nombre.trim(),
          telefono: telefono.trim()
        },
        emailRedirectTo: redirectTo
      }
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'No se pudo crear el usuario.' }
    }

    // Si el usuario requiere confirmación de correo (no hay sesión o confirmed_at es null),
    // cerramos cualquier sesión y forzamos el flujo de verificación.
    if (!data.session || !data.user.confirmed_at) {
      try {
        await supabase.auth.signOut()
      } catch {
        // Ignorar
      }
      return { user: null, error: null, requiereConfirmacion: true }
    }

    const usuarioNuevo: PerfilUsuario = {
      id: data.user.id,
      nombre: nombre.trim(),
      email: emailLimpio,
      telefono: telefono.trim(),
      rol: 'cliente',
      activo: true
    }

    return { user: usuarioNuevo, error: null }
  },

  // Obtener perfil por ID
  async getPerfilPorId(userId: string): Promise<PerfilUsuario | null> {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre, email, telefono, rol, activo')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      return data as PerfilUsuario
    } catch {
      return null
    }
  },

  // Obtiene el usuario actual con sesión activa
  async getUsuarioActual(): Promise<PerfilUsuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const emailLimpio = user.email?.toLowerCase() || ''
      const esTamara = emailLimpio.includes('tamfranco') || emailLimpio.includes('tamfrango')
      const esLeonel = emailLimpio.includes('leonel')
      const esGrimanez = emailLimpio.includes('grim')

      let usuarioActual: PerfilUsuario = {
        id: user.id,
        nombre: esTamara ? 'Tamara Franco' : (esLeonel ? 'Leonel Armin Mayta' : (esGrimanez ? 'Grimanez Cordero' : (user.user_metadata?.nombre || 'Usuario'))),
        email: emailLimpio,
        telefono: user.user_metadata?.telefono,
        rol: esTamara ? 'administrador' : (esLeonel ? 'recepcionista' : (esGrimanez ? 'limpieza' : 'cliente')),
        activo: true
      }

      try {
        const perfilData = await this.getPerfilPorId(user.id)
        if (perfilData) {
          usuarioActual = perfilData
        }
      } catch {
        // Fallback activo
      }

      return usuarioActual
    } catch {
      return null
    }
  },

  // Cerrar sesión
  async cerrarSesion(): Promise<void> {
    await supabase.auth.signOut()
  }
}