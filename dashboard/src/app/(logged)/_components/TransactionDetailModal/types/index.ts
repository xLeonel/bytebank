export type TransactionAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  category?: string;
  agency?: string;
  account?: string;
  pixKey?: string;
  attachments?: TransactionAttachment[];
};

export type Props = {
  transaction: Transaction | null;
  onClose: () => void;
};
