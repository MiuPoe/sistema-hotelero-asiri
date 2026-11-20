// Retorna la fecha local en formato YYYY-MM-DD
export function getFechaHoy(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Horario estándar del hotel: Check-in de 8:30 a 12:00
export function esFueraDeHorario(horaStr?: string): boolean {
  let minutosTotales = 0;
  if (horaStr) {
    const [h, m] = horaStr.split(':').map(Number);
    minutosTotales = h * 60 + (m || 0);
  } else {
    const ahora = new Date();
    minutosTotales = ahora.getHours() * 60 + ahora.getMinutes();
  }

  const inicioCheckIn = 8 * 60 + 30; // 08:30 -> 510 min
  const finCheckIn = 12 * 60;        // 12:00 -> 720 min

  return minutosTotales < inicioCheckIn || minutosTotales > finCheckIn;
}

export function formatMoneda(monto: number): string {
  return `${monto.toFixed(2)} Bs`;
}