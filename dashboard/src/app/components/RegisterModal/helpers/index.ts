import { REGISTER_VALIDATIONS } from "../constants";
import type { RegisterFormData } from "../types";

export const validateForm = (data: RegisterFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "Nome é obrigatório";
  }

  if (!data.email.trim()) {
    errors.email = "Email é obrigatório";
  } else if (!REGISTER_VALIDATIONS.emailRegex.test(data.email)) {
    errors.email = "Email inválido";
  }

  if (!data.password) {
    errors.password = "Senha é obrigatória";
  } else if (data.password.length < REGISTER_VALIDATIONS.minPasswordLength) {
    errors.password = `Senha deve ter pelo menos ${REGISTER_VALIDATIONS.minPasswordLength} caracteres`;
  }

  if (!data.agency.trim()) {
    errors.agency = "Agência é obrigatória";
  }

  if (!data.bankAccount.trim()) {
    errors.bankAccount = "Conta bancária é obrigatória";
  }

  if (!data.terms) {
    errors.terms = "É necessário aceitar os termos";
  }

  return errors;
};
