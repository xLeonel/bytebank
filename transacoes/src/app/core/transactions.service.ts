import { Injectable } from '@angular/core';
import {
  createTransaction,
  updateTransaction as apiUpdate,
  deleteTransaction as apiDelete,
  fileToApiAttachment,
  inferDepositType,
  toApiAttachments,
  toIsoDate,
  TYPE_API,
  getProfile,
  type ApiAttachment,
  type ApiTransactionType,
  type Transaction,
} from '@bytebank/core';
import { bus, TRANSACTION_EVENTS } from '@bytebank/mfe-events';
import { getCurrentUserId } from './session';

/** Detalhe emitido pelo bb-new-transaction-list (evento 'submit'). */
export interface NewTransactionDetail {
  type: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  category?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  attachments?: File[];
}

/** Detalhe emitido pelo bb-transaction-detail-modal (evento 'save'). */
export interface SaveTransactionDetail {
  id: string;
  description: string;
  amount: number; // já com sinal
  date: string; // DD/MM/YYYY
  category?: string;
  newAttachments?: File[];
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  /** Cria transação (espelha a NovaTransacaoForm da Fase 1) e avisa o bus. */
  async create(detail: NewTransactionDetail): Promise<void> {
    const files = detail.attachments ?? [];
    const attachments = await Promise.all(files.map(fileToApiAttachment));

    // Saque e Depósito na própria conta não trazem ag/conta — enriquece com a
    // conta do usuário logado (via profile), como fazia o app React.
    const needsOwn =
      detail.type === 'Saque' || (detail.type === 'Depósito' && detail.amount > 0);
    let agency = detail.agency;
    let account = detail.account;
    if (needsOwn) {
      try {
        const profile = await getProfile();
        agency = profile.agency ?? agency;
        account = profile.bankAccount ?? account;
      } catch {
        /* segue sem enriquecer */
      }
    }

    // O DS emite o valor já com sinal; a API exige positivo e aplica o sinal no
    // servidor. Por isso o destino do depósito vai explícito — sem ele, um
    // depósito em outra conta era somado ao saldo em vez de subtraído.
    const depositType = inferDepositType(detail.type, Number(detail.amount));

    await createTransaction({
      userId: getCurrentUserId(),
      type: (TYPE_API[detail.type] ?? detail.type) as ApiTransactionType,
      depositType,
      amount: Math.abs(Number(detail.amount)),
      date: detail.date,
      description: detail.description,
      category: detail.category,
      agency,
      account,
      pixKey: detail.pixKey,
      attachments,
    });
    bus.emit(TRANSACTION_EVENTS.CHANGED, { reason: 'created' });
  }

  /** Atualiza transação (espelha o DetailModal da Fase 1) e avisa o bus. */
  async update(detail: SaveTransactionDetail, existing?: Transaction['attachments']): Promise<void> {
    const newFile = detail.newAttachments?.[0];
    const attachments: ApiAttachment[] = newFile
      ? [await fileToApiAttachment(newFile)]
      : toApiAttachments(existing);
    await apiUpdate(detail.id, {
      description: detail.description,
      amount: detail.amount,
      date: toIsoDate(detail.date),
      category: detail.category,
      attachments,
    });
    bus.emit(TRANSACTION_EVENTS.CHANGED, { reason: 'updated', id: detail.id });
  }

  /** Exclui transação e avisa o bus. */
  async remove(id: string): Promise<void> {
    await apiDelete(id);
    bus.emit(TRANSACTION_EVENTS.CHANGED, { reason: 'deleted', id });
  }
}
