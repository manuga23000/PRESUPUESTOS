export interface LineItem {
  cantidad: string;
  descripcion: string;
  importe: string;
}

export interface PresupuestoData {
  nombre: string;
  vehiculo: string;
  items: LineItem[];
  total: string;
}

export interface PresupuestoGuardado extends PresupuestoData {
  id: string;
  creadoEn: Date;
}
