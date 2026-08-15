export type Props = {
  greetingName: string;
  today: string;
  accountType: string;
  /** Agência da conta do usuário; exibida sob o tipo de conta. */
  agency?: string;
  /** Número da conta do usuário; exibido sob o tipo de conta. */
  account?: string;
};
