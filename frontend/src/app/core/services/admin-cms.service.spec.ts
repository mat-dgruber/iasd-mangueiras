import { TestBed } from '@angular/core/testing';
import { AdminCmsService } from './admin-cms.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AdminCmsService', () => {
  let service: AdminCmsService;

  describe('Sem conexão Firestore', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AdminCmsService,
          {
            provide: FirebaseService,
            useValue: { firestore: null },
          },
        ],
      });
      service = TestBed.inject(AdminCmsService);
    });

    it('retorna array vazio para getHorariosRegulares quando Firestore é nulo', async () => {
      const res = await service.getHorariosRegulares();
      expect(res).toEqual([]);
    });

    it('retorna array vazio para getAvisosHorarios quando Firestore é nulo', async () => {
      const res = await service.getAvisosHorarios();
      expect(res).toEqual([]);
    });

    it('lança erro ao tentar salvar horário regular sem Firestore', async () => {
      await expect(service.saveHorarioRegular({ titulo: 'Culto' })).rejects.toThrow(
        'Firestore indisponível',
      );
    });

    it('lança erro ao tentar deletar horário regular sem Firestore', async () => {
      await expect(service.deleteHorarioRegular('id-123')).rejects.toThrow('Firestore indisponível');
    });

    it('lança erro ao tentar alternar status de horário regular sem Firestore', async () => {
      await expect(service.toggleHorarioAtivo('id-123', false)).rejects.toThrow(
        'Firestore indisponível',
      );
    });

    it('lança erro ao tentar salvar aviso sem Firestore', async () => {
      await expect(
        service.saveAvisoHorario({ titulo: 'Aviso', mensagem: 'Msg' }),
      ).rejects.toThrow('Firestore indisponível');
    });
  });
});
