export type ModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
};

export type ModalHeaderProps = {
  icon: React.ReactNode;
  title: string;
};
