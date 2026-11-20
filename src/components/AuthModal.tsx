import React, { useState, useEffect, useRef } from 'react'
import { authService, type PerfilUsuario } from '../services/authService'

export interface AuthModalProps {
  isOpen?: boolean
  onClose: () => void
  onLoginSuccess?: (user: PerfilUsuario) => void
  onLogin?: (user: PerfilUsuario) => void
}

export default function AuthModal({ isOpen = true, onClose, onLoginSuccess, onLogin }: AuthModalProps) {
  if (!isOpen) return null

  const [tab, setTab] = useState<'login' | 'register'>('login')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  
  const [cargando, setCargando] = useState(false)
  const [authError, setAuthError] = useState('')
  
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [notRobotChecked, setNotRobotChecked] = useState(false)
  const [captchaError, setCaptchaError] = useState('')
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const generateCaptchaCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FBF5EA'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const lineColors = ['#8A5326', '#C2570C', '#6E5644', '#B38B6D', '#2E1D12']
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = lineColors[i % lineColors.length]
      ctx.lineWidth = 1 + Math.random() * 1.5
      ctx.beginPath()
      ctx.moveTo(Math.random() * 20, Math.random() * canvas.height)
      ctx.bezierCurveTo(
        Math.random() * canvas.width * 0.5, Math.random() * canvas.height,
        Math.random() * canvas.width * 0.8, Math.random() * canvas.height,
        canvas.width - Math.random() * 15, Math.random() * canvas.height
      )
      ctx.stroke()
    }

    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = lineColors[Math.floor(Math.random() * lineColors.length)]
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    const letterColors = ['#5A3418', '#8B2500', '#1A365D', '#1C4522', '#703A0E']
    const spacing = canvas.width / (code.length + 1)
    
    ctx.textBaseline = 'middle'
    for (let i = 0; i < code.length; i++) {
      ctx.save()
      const char = code[i]
      const x = spacing * (i + 1)
      const y = canvas.height / 2 + (Math.random() * 6 - 3)
      const angle = (Math.random() * 26 - 13) * (Math.PI / 180)
      
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.font = 'bold 26px "Young Serif", Georgia, serif'
      ctx.fillStyle = letterColors[i % letterColors.length]
      ctx.fillText(char, -10, 2)
      ctx.restore()
    }
  }

  const reloadCaptcha = () => {
    const newCode = generateCaptchaCode()
    setCaptchaCode(newCode)
    setCaptchaInput('')
    setCaptchaError('')
    setTimeout(() => drawCaptcha(newCode), 50)
  }

  useEffect(() => {
    reloadCaptcha()
    setNotRobotChecked(false)
    setCaptchaError('')
    setAuthError('')
  }, [tab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCaptchaError('')
    setAuthError('')

    if (!notRobotChecked) {
      setCaptchaError('Debes marcar la casilla "No soy un robot"')
      return
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError('El código de la imagen no coincide. Intenta de nuevo.')
      reloadCaptcha()
      return
    }

    setCargando(true)

    try {
      if (tab === 'login') {
        const { user, error } = await authService.iniciarSesion(email.trim().toLowerCase(), password)
        if (error || !user) {
          setAuthError(error === 'Invalid login credentials' 
            ? 'Credenciales incorrectas. Verifica tu correo y contraseña.' 
            : (error || 'No se pudo iniciar sesión.'))
          setCargando(false)
          reloadCaptcha()
          return
        }

        if (onLoginSuccess) onLoginSuccess(user)
        if (onLogin) onLogin(user)
        onClose()
      } else {
        const { user, error } = await authService.registrarse(email.trim().toLowerCase(), password, nombre, telefono)
        if (error || !user) {
          setAuthError(error || 'No se pudo crear la cuenta.')
          setCargando(false)
          return
        }

        if (onLoginSuccess) onLoginSuccess(user)
        if (onLogin) onLogin(user)
        onClose()
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error de conexión con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#24170E] border border-[#E6D5BC]/20 rounded-2xl shadow-2xl p-6 sm:p-7 text-[#F5EBDC] max-h-[90vh] overflow-y-auto">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[#E6D5BC]/15 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center border border-[#E0A526]">
              <img src="/logo.png" alt="Hotel Asiri" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#F5EBDC]" style={{ fontFamily: '"Young Serif", Georgia, serif' }}>
                {tab === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
              </h2>
              <p className="text-[11px] text-[#C9B096]">Hotel Asiri · Tarija</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-[#C9B096] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#C9B096] mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A0F08] border border-[#E6D5BC]/20 text-white placeholder-stone-500 focus:outline-none focus:border-[#E0A526] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C9B096] mb-1">Número de teléfono *</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Teléfono o WhatsApp"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A0F08] border border-[#E6D5BC]/20 text-white placeholder-stone-500 focus:outline-none focus:border-[#E0A526] text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#C9B096] mb-1">Correo electrónico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A0F08] border border-[#E6D5BC]/20 text-white placeholder-stone-500 focus:outline-none focus:border-[#E0A526] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C9B096] mb-1">Contraseña *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A0F08] border border-[#E6D5BC]/20 text-white placeholder-stone-500 focus:outline-none focus:border-[#E0A526] text-sm"
            />
          </div>

          {/* VERIFICACIÓN CAPTCHA */}
          <div className="pt-1">
            <div className="bg-[#1A0F08] border border-[#E6D5BC]/20 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <svg className="w-4 h-4 text-[#4A90E2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Verificación de seguridad</span>
              </div>

              <label className="flex items-center justify-between p-2.5 bg-[#24170E] rounded-lg border border-[#E6D5BC]/15 cursor-pointer hover:border-[#E0A526]/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={notRobotChecked}
                    onChange={(e) => setNotRobotChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E0A526] focus:ring-0 bg-[#1A0F08] border-[#E6D5BC]/30 cursor-pointer accent-[#E0A526]"
                  />
                  <span className="text-xs text-[#F5EBDC]">No soy un robot</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-60 text-[10px]">
                  <span className="font-semibold text-sky-400">reCAPTCHA</span>
                </div>
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg overflow-hidden border border-[#E6D5BC]/25 shadow-inner">
                  <canvas ref={canvasRef} width={180} height={46} className="w-full h-11 block" />
                </div>
                <button
                  type="button"
                  onClick={reloadCaptcha}
                  title="Cambiar imagen"
                  className="h-11 px-3 rounded-lg bg-[#24170E] border border-[#E6D5BC]/20 hover:border-[#E0A526] text-[#E0A526] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </button>
              </div>

              <input
                type="text"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="INGRESA LOS 5 CARACTERES..."
                maxLength={5}
                className="w-full px-3 py-2 rounded-lg bg-[#24170E] border border-[#E6D5BC]/30 text-white placeholder-stone-500 focus:outline-none focus:border-[#E0A526] text-xs uppercase tracking-widest font-mono text-center font-bold"
              />

              {captchaError && (
                <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-lg p-2 text-center">
                  {captchaError}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="flex-1 py-2.5 rounded-full border border-[#E6D5BC]/20 text-[#C9B096] hover:text-white hover:bg-white/5 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 py-2.5 rounded-full bg-[#E0A526] text-[#1E140C] hover:bg-[#F28C38] font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {cargando ? 'Verificando...' : (tab === 'register' ? 'Registrarse' : 'Ingresar')}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setTab(tab === 'register' ? 'login' : 'register')}
              className="text-xs text-[#E0A526] hover:underline cursor-pointer"
            >
              {tab === 'register' 
                ? '¿Ya tienes cuenta? Inicia sesión aquí' 
                : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}