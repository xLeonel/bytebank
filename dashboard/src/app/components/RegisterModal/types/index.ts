export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  terms: boolean;
  agency: string;
  bankAccount: string;
};

export type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: RegisterFormData) => void;
  onSuccess?: () => void;
};
