import { supabase } from '../lib/supabase'

export interface Ambiente {
  id: string
  codigo: string
  tipo: string
  capacidad: number
  precioBase: number
  piso: number
  estado: 'Disponible' | 'Reservado' | 'En uso' | 'En limpieza'
}

// Lista oficial de los 23 ambientes del Hotel Asiri
const AMBIENTES_OFICIALES: Ambiente[] = [
  { id: '1', codigo: 'HAB-101', tipo: 'Simple', capacidad: 1, precioBase: 120, piso: 1, estado: 'Disponible' },
  { id: '2', codigo: 'HAB-102', tipo: 'Simple', capacidad: 1, precioBase: 120, piso: 1, estado: 'Disponible' },
  { id: '3', codigo: 'HAB-103', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 1, estado: 'Disponible' },
  { id: '4', codigo: 'HAB-104', tipo: 'Doble', capacidad: 2, precioBase: 200, piso: 1, estado: 'Disponible' },
  { id: '5', codigo: 'HAB-105', tipo: 'Simple', capacidad: 1, precioBase: 120, piso: 1, estado: 'Disponible' },
  { id: '6', codigo: 'HAB-201', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 2, estado: 'Disponible' },
  { id: '7', codigo: 'HAB-202', tipo: 'Doble', capacidad: 2, precioBase: 200, piso: 2, estado: 'Disponible' },
  { id: '8', codigo: 'HAB-203', tipo: 'Familiar', capacidad: 4, precioBase: 280, piso: 2, estado: 'Disponible' },
  { id: '9', codigo: 'HAB-204', tipo: 'Simple', capacidad: 1, precioBase: 120, piso: 2, estado: 'Disponible' },
  { id: '10', codigo: 'HAB-205', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 2, estado: 'Disponible' },
  { id: '11', codigo: 'HAB-301', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 3, estado: 'Disponible' },
  { id: '12', codigo: 'HAB-302', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 3, estado: 'Disponible' },
  { id: '13', codigo: 'HAB-303', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 3, estado: 'Disponible' },
  { id: '14', codigo: 'HAB-304', tipo: 'Familiar', capacidad: 4, precioBase: 280, piso: 3, estado: 'Disponible' },
  { id: '15', codigo: 'HAB-305', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 3, estado: 'Disponible' },
  { id: '16', codigo: 'HAB-401', tipo: 'Simple', capacidad: 1, precioBase: 120, piso: 4, estado: 'Disponible' },
  { id: '17', codigo: 'HAB-402', tipo: 'Simple', capacidad: 1, precioBase: 120, piso: 4, estado: 'Disponible' },
  { id: '18', codigo: 'HAB-403', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 4, estado: 'Disponible' },
  { id: '19', codigo: 'HAB-404', tipo: 'Doble', capacidad: 2, precioBase: 200, piso: 4, estado: 'Disponible' },
  { id: '20', codigo: 'HAB-405', tipo: 'Matrimonial', capacidad: 2, precioBase: 180, piso: 4, estado: 'Disponible' },
  { id: '21', codigo: 'CW-01', tipo: 'Coworking 1', capacidad: 10, precioBase: 50, piso: 1, estado: 'Disponible' },
  { id: '22', codigo: 'CW-02', tipo: 'Coworking 2', capacidad: 10, precioBase: 50, piso: 1, estado: 'Disponible' },
  { id: '23', codigo: 'COM-01', tipo: 'Comedor', capacidad: 30, precioBase: 0, piso: 1, estado: 'Disponible' }
]

export const ambientesService = {
  async getAmbientes(): Promise<Ambiente[]> {
    try {
      const { data, error } = await supabase
        .from('ambientes')
        .select('id, codigo, tipo, capacidad, precio_base, piso, estado')
        .order('codigo', { ascending: true })

      if (error || !data || data.length === 0) {
        return AMBIENTES_OFICIALES
      }

      return data.map((item: any) => ({
        id: item.id,
        codigo: item.codigo,
        tipo: item.tipo,
        capacidad: item.capacidad,
        precioBase: Number(item.precio_base),
        piso: item.piso,
        estado: item.estado || 'Disponible'
      }))
    } catch {
      return AMBIENTES_OFICIALES
    }
  }
}