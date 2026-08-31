import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirebaseService } from '../firebase/firebase.service';
import { Evento, Comunicado, PequenoGrupo, AvisoHorarioEspecial, EscalaItem, Ministerio, Horario } from '../models/content.models';

export interface PedidoOracaoAdmin {
  id?: string;
  nome: string;
  telefone?: string;
  pedido: string;
  confidencial: boolean;
  status: 'pendente' | 'orado' | 'arquivado';
  created_at?: unknown;
}

export interface MensagemContatoAdmin {
  id?: string;
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
  assunto?: string;
  criadoEm?: unknown;
  created_at?: unknown;
  lido?: boolean;
  respondido?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminCmsService {
  private readonly firebase = inject(FirebaseService);

  // ----------------------------------------------------
  // EVENTOS
  // ----------------------------------------------------
  async getEventos(): Promise<Evento[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'eventos');
      const q = query(colRef, orderBy('data', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Evento);
    } catch {
      return [];
    }
  }

  async saveEvento(evento: Partial<Evento>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const colRef = collection(this.firebase.firestore, 'eventos');
    if (id) {
      const docRef = doc(this.firebase.firestore, 'eventos', id);
      await updateDoc(docRef, { ...evento, updated_at: serverTimestamp() });
      return id;
    } else {
      const res = await addDoc(colRef, {
        ...evento,
        created_at: serverTimestamp(),
      });
      return res.id;
    }
  }

  async deleteEvento(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'eventos', id);
    await deleteDoc(docRef);
  }

  async uploadBanner(file: File): Promise<string> {
    if (!this.firebase.storage) throw new Error('Firebase Storage indisponível');
    const storageRef = ref(this.firebase.storage, `banners/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  // ----------------------------------------------------
  // COMUNICADOS
  // ----------------------------------------------------
  async getComunicados(): Promise<Comunicado[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'comunicados');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Comunicado);
    } catch {
      return [];
    }
  }

  async saveComunicado(comunicado: Partial<Comunicado>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    if (id) {
      const docRef = doc(this.firebase.firestore, 'comunicados', id);
      await updateDoc(docRef, { ...comunicado, updated_at: serverTimestamp() });
      return id;
    } else {
      const colRef = collection(this.firebase.firestore, 'comunicados');
      const res = await addDoc(colRef, {
        ...comunicado,
        ativo: comunicado.ativo ?? true,
        created_at: serverTimestamp(),
      });
      return res.id;
    }
  }

  async deleteComunicado(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'comunicados', id);
    await deleteDoc(docRef);
  }

  // ----------------------------------------------------
  // PEDIDOS DE ORAÇÃO & ESTUDOS BÍBLICOS
  // ----------------------------------------------------
  async getOracoes(): Promise<PedidoOracaoAdmin[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'pedidos_oracao');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PedidoOracaoAdmin);
    } catch {
      return [];
    }
  }

  async updateOracaoStatus(id: string, status: 'pendente' | 'orado' | 'arquivado'): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'pedidos_oracao', id);
    await updateDoc(docRef, { status, updated_at: serverTimestamp() });
  }

  async deleteOracao(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'pedidos_oracao', id);
    await deleteDoc(docRef);
  }

  // ----------------------------------------------------
  // HORÁRIOS REGULARES
  // ----------------------------------------------------
  async getHorariosRegulares(): Promise<Horario[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'horarios_regulares');
      const q = query(colRef, orderBy('ordem', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Horario);
    } catch {
      return [];
    }
  }

  async saveHorarioRegular(horario: Partial<Horario>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docId = id || horario.id;
    if (docId) {
      const docRef = doc(this.firebase.firestore, 'horarios_regulares', docId);
      const dataToUpdate = { ...horario };
      delete dataToUpdate.id;
      await updateDoc(docRef, { ...dataToUpdate, updated_at: serverTimestamp() });
      return docId;
    } else {
      const colRef = collection(this.firebase.firestore, 'horarios_regulares');
      const dataToSave = { ...horario };
      delete dataToSave.id;
      const res = await addDoc(colRef, {
        ...dataToSave,
        ativo: horario.ativo ?? true,
        created_at: serverTimestamp(),
      });
      return res.id;
    }
  }

  async deleteHorarioRegular(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'horarios_regulares', id);
    await deleteDoc(docRef);
  }

  async toggleHorarioAtivo(id: string, ativo: boolean): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'horarios_regulares', id);
    await updateDoc(docRef, { ativo, updated_at: serverTimestamp() });
  }

  // ----------------------------------------------------
  // AVISOS DE HORÁRIOS ESPECIAIS
  // ----------------------------------------------------
  async getAvisosHorarios(): Promise<AvisoHorarioEspecial[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'avisos_horarios');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AvisoHorarioEspecial);
    } catch {
      return [];
    }
  }

  async saveAvisoHorario(aviso: Partial<AvisoHorarioEspecial>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docId = id || aviso.id;
    if (docId) {
      const docRef = doc(this.firebase.firestore, 'avisos_horarios', docId);
      const dataToUpdate = { ...aviso };
      delete dataToUpdate.id;
      await updateDoc(docRef, { ...dataToUpdate, updated_at: serverTimestamp() });
      return docId;
    } else {
      const colRef = collection(this.firebase.firestore, 'avisos_horarios');
      const dataToSave = { ...aviso };
      delete dataToSave.id;
      const res = await addDoc(colRef, {
        ...dataToSave,
        ativo: aviso.ativo ?? true,
        created_at: serverTimestamp(),
      });
      return res.id;
    }
  }

  async deleteAvisoHorario(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'avisos_horarios', id);
    await deleteDoc(docRef);
  }

  // ----------------------------------------------------
  // PEQUENOS GRUPOS (PGs)
  // ----------------------------------------------------
  async getPgs(): Promise<PequenoGrupo[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'pequenos_grupos');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as PequenoGrupo);
    } catch {
      return [];
    }
  }

  async savePg(pg: Partial<PequenoGrupo>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    if (id) {
      const docRef = doc(this.firebase.firestore, 'pequenos_grupos', id);
      await updateDoc(docRef, { ...pg, updated_at: serverTimestamp() });
      return id;
    } else {
      const colRef = collection(this.firebase.firestore, 'pequenos_grupos');
      const res = await addDoc(colRef, {
        ...pg,
        ativo: pg.ativo ?? true,
        created_at: serverTimestamp(),
      });
      return res.id;
    }
  }

  async deletePg(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'pequenos_grupos', id);
    await deleteDoc(docRef);
  }

  async togglePgAtivo(id: string, ativo: boolean): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'pequenos_grupos', id);
    await updateDoc(docRef, { ativo, updated_at: serverTimestamp() });
  }

  // ----------------------------------------------------
  // ESCALAS DOS DEPARTAMENTOS
  // ----------------------------------------------------
  async getEscalas(): Promise<EscalaItem[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'escalas');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as EscalaItem);
    } catch {
      return [];
    }
  }

  async saveEscala(escala: Partial<EscalaItem>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    if (id) {
      const docRef = doc(this.firebase.firestore, 'escalas', id);
      await updateDoc(docRef, { ...escala, updated_at: serverTimestamp() });
      return id;
    } else {
      const colRef = collection(this.firebase.firestore, 'escalas');
      const res = await addDoc(colRef, {
        ...escala,
        created_at: serverTimestamp(),
      });
      return res.id;
    }
  }

  async deleteEscala(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'escalas', id);
    await deleteDoc(docRef);
  }

  // ----------------------------------------------------
  // MINISTÉRIOS
  // ----------------------------------------------------
  async getMinisterios(): Promise<Ministerio[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'ministerios');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Ministerio);
    } catch {
      return [];
    }
  }

  async saveMinisterio(ministerio: Partial<Ministerio>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    if (id) {
      const docRef = doc(this.firebase.firestore, 'ministerios', id);
      await updateDoc(docRef, { ...ministerio, updated_at: serverTimestamp() });
      return id;
    } else {
      const colRef = collection(this.firebase.firestore, 'ministerios');
      const res = await addDoc(colRef, {
        ...ministerio,
        created_at: serverTimestamp(),
      });
      return res.id;
    }
  }

  async deleteMinisterio(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'ministerios', id);
    await deleteDoc(docRef);
  }

  async uploadMinisterioImage(file: File): Promise<string> {
    if (!this.firebase.storage) throw new Error('Firebase Storage indisponível');
    const storageRef = ref(this.firebase.storage, `ministerios/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  // ----------------------------------------------------
  // MENSAGENS DE CONTATO
  // ----------------------------------------------------
  async getMensagensContato(): Promise<MensagemContatoAdmin[]> {
    if (!this.firebase.firestore) return [];
    try {
      const colRef = collection(this.firebase.firestore, 'mensagens_contato');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as MensagemContatoAdmin);
    } catch {
      return [];
    }
  }

  async updateMensagemContatoStatus(
    id: string,
    updates: Partial<MensagemContatoAdmin>,
  ): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'mensagens_contato', id);
    await updateDoc(docRef, { ...updates, updated_at: serverTimestamp() });
  }

  async deleteMensagemContato(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'mensagens_contato', id);
    await deleteDoc(docRef);
  }
}