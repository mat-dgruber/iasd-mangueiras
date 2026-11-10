import { Injectable, computed, inject, signal } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import {
  CronogramaCulto,
  CronogramaTemplate,
  TEMPLATES_NATIVOS,
} from '../models/cronograma.models';

@Injectable({ providedIn: 'root' })
export class AdminCronogramaService {
  private readonly firebase = inject(FirebaseService);

  private readonly _cronogramas = signal<readonly CronogramaCulto[]>([]);
  readonly cronogramas = this._cronogramas.asReadonly();

  private readonly _cronogramaSelecionado = signal<CronogramaCulto | null>(null);
  readonly cronogramaSelecionado = this._cronogramaSelecionado.asReadonly();

  private readonly _templatesCustomizados = signal<readonly CronogramaTemplate[]>([]);
  readonly templatesCustomizados = this._templatesCustomizados.asReadonly();

  private readonly _carregando = signal(false);
  readonly carregando = this._carregando.asReadonly();

  readonly templates = computed<readonly CronogramaTemplate[]>(() => [
    ...TEMPLATES_NATIVOS,
    ...this._templatesCustomizados(),
  ]);

  selecionarCronograma(cronograma: CronogramaCulto | null): void {
    this._cronogramaSelecionado.set(cronograma);
  }

  criarNovoCronogramaDeTemplate(template: CronogramaTemplate, data: string): CronogramaCulto {
    const agora = new Date().toISOString();

    return {
      id: '',
      data,
      titulo: template.nome,
      tipoCulto: template.tipoCulto,
      observacoesGerais: template.descricao ?? '',
      itens: template.itens.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`,
        ordem: index,
      })),
      criadoEm: agora,
      atualizadoEm: agora,
    };
  }

  async carregarCronogramas(): Promise<void> {
    if (!this.firebase.firestore) {
      this._cronogramas.set([]);
      return;
    }

    try {
      const colRef = collection(this.firebase.firestore, 'cronogramas_culto');
      const q = query(colRef, orderBy('data', 'desc'));
      const snap = await getDocs(q);
      this._cronogramas.set(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CronogramaCulto));
    } catch {
      this._cronogramas.set([]);
    }
  }

  async carregarTemplatesCustomizados(): Promise<void> {
    if (!this.firebase.firestore) {
      this._templatesCustomizados.set([]);
      return;
    }

    try {
      const colRef = collection(this.firebase.firestore, 'cronogramas_templates');
      const q = query(colRef, orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      this._templatesCustomizados.set(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CronogramaTemplate),
      );
    } catch {
      this._templatesCustomizados.set([]);
    }
  }

  async salvarCronograma(cronograma: Partial<CronogramaCulto>, id?: string): Promise<string> {
    if (!this.firebase.firestore) {
      throw new Error('Firestore indisponível');
    }

    this._carregando.set(true);
    try {
      const agora = new Date().toISOString();
      const { id: _id, ...dados } = cronograma;

      if (id) {
        const docRef = doc(this.firebase.firestore, 'cronogramas_culto', id);
        await updateDoc(docRef, {
          ...dados,
          atualizadoEm: agora,
        });
        return id;
      }

      const colRef = collection(this.firebase.firestore, 'cronogramas_culto');
      const res = await addDoc(colRef, {
        ...dados,
        criadoEm: dados.criadoEm ?? agora,
        atualizadoEm: agora,
        created_at: serverTimestamp(),
      });
      return res.id;
    } finally {
      this._carregando.set(false);
      await this.carregarCronogramas();
    }
  }

  async excluirCronograma(id: string): Promise<void> {
    if (!this.firebase.firestore) {
      throw new Error('Firestore indisponível');
    }

    this._carregando.set(true);
    try {
      await deleteDoc(doc(this.firebase.firestore, 'cronogramas_culto', id));
      if (this._cronogramaSelecionado()?.id === id) {
        this._cronogramaSelecionado.set(null);
      }
    } finally {
      this._carregando.set(false);
      await this.carregarCronogramas();
    }
  }

  async salvarTemplateCustomizado(template: Omit<CronogramaTemplate, 'id'>): Promise<string> {
    if (!this.firebase.firestore) {
      throw new Error('Firestore indisponível');
    }

    const colRef = collection(this.firebase.firestore, 'cronogramas_templates');
    const agora = new Date().toISOString();
    const res = await addDoc(colRef, {
      ...template,
      criadoEm: template.criadoEm || agora,
      isNativo: false,
      created_at: serverTimestamp(),
    });
    await this.carregarTemplatesCustomizados();
    return res.id;
  }

  async excluirTemplateCustomizado(id: string): Promise<void> {
    if (!this.firebase.firestore) {
      throw new Error('Firestore indisponível');
    }

    await deleteDoc(doc(this.firebase.firestore, 'cronogramas_templates', id));
    await this.carregarTemplatesCustomizados();
  }
}
