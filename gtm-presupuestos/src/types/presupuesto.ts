export interface LineItem {
  cantidad: string;
  descripcion: string;
  importe: string;
}

export type Moneda = "ARS" | "USD";
export type Condicion = "default" | "anticipo" | "anticipo-modificable";
export type TipoPresupuesto = "simple" | "detallado";

export interface PresupuestoData {
  nombre: string;
  vehiculo: string;
  items: LineItem[];
  total: string;
  moneda: Moneda;
  condicion: Condicion;
  tipo: TipoPresupuesto;
}

export interface PresupuestoGuardado extends PresupuestoData {
  id: string;
  creadoEn: Date;
}
