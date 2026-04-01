import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { PresupuestoData, PresupuestoGuardado } from "@/types/presupuesto";

export async function guardarPresupuesto(data: PresupuestoData): Promise<string> {
  const docRef = await addDoc(collection(db, "presupuestos"), {
    ...data,
    creadoEn: Timestamp.now(),
  });
  return docRef.id;
}

export async function listarPresupuestos(): Promise<PresupuestoGuardado[]> {
  const q = query(collection(db, "presupuestos"), orderBy("creadoEn", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      nombre: data.nombre,
      vehiculo: data.vehiculo,
      items: data.items,
      total: data.total,
      creadoEn: (data.creadoEn as Timestamp).toDate(),
    };
  });
}

export async function eliminarPresupuesto(id: string): Promise<void> {
  await deleteDoc(doc(db, "presupuestos", id));
}
