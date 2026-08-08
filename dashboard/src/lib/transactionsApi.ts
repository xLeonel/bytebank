import http from "@/http";
import type { TransactionAttachment } from "@/app/(logged)/_components/TransactionDetailModal/types";

/** Formato do anexo trafegado com o backend (comprovante). */
export type ApiAttachment = { name: string; type: string; url: string };

/** Converte um File em anexo base64 (data URL) para envio ao backend. */
export function fileToApiAttachment(file: File): Promise<ApiAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ name: file.name, type: file.type, url: reader.result as string });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Anexos do app -> formato do backend (sem id/size). */
export function toApiAttachments(
  attachments: TransactionAttachment[] | undefined
): ApiAttachment[] {
  return (attachments ?? []).map((a) => ({ name: a.name, type: a.type, url: a.url }));
}

/** Anexos do backend -> formato do app (com id estável e size). */
export function toClientAttachments(
  attachments: ApiAttachment[] | undefined,
  txId: string
): TransactionAttachment[] {
  return (attachments ?? []).map((a, i) => ({
    id: `${txId}-${i}`,
    name: a.name,
    size: 0,
    type: a.type,
    url: a.url,
  }));
}

/** "DD/MM/YYYY" -> "YYYY-MM-DD" (o backend valida IsDateString). */
export function toIsoDate(display: string): string {
  const [d, m, y] = display.split("/");
  return y && m && d ? `${y}-${m}-${d}` : display;
}

export function updateTransactionApi(
  id: string,
  data: {
    description?: string;
    amount?: number;
    date?: string;
    attachments?: ApiAttachment[];
  }
) {
  return http.patch(`/transactions/${id}`, data);
}

export function deleteTransactionApi(id: string) {
  return http.delete(`/transactions/${id}`);
}
