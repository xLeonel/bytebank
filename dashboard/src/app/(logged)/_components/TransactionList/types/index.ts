import type { Transaction } from "@/app/(logged)/_components/TransactionDetailModal/types";

export type Props = {
  items: Transaction[];
  onSelect: (tx: Transaction) => void;
  showDividers?: boolean;
  showDescription?: boolean;
};
