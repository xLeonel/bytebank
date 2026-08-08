import { isValidCategory } from './category.js';

export type ValidationResult = { valid: boolean; message?: string };

const OK: ValidationResult = { valid: true };

/** Valor deve ser um número finito e maior que zero. */
export function validateAmount(amount: number): ValidationResult {
  if (!Number.isFinite(amount)) return { valid: false, message: 'Informe um valor válido.' };
  if (amount <= 0) return { valid: false, message: 'O valor deve ser maior que zero.' };
  return OK;
}

/** Campo obrigatório não pode ser vazio. */
export function validateRequired(value: string | undefined | null, label = 'Campo'): ValidationResult {
  if (!value || !value.trim()) return { valid: false, message: `${label} é obrigatório.` };
  return OK;
}

/**
 * Data (YYYY-MM-DD ou DD/MM/YYYY) não pode ser futura.
 * Compara só a parte de data, ignorando horário/fuso.
 */
export function validateDateNotFuture(date: string): ValidationResult {
  if (!date) return { valid: false, message: 'Informe uma data.' };
  const iso = date.includes('/')
    ? date.split('/').reverse().join('-')
    : date.slice(0, 10);
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return { valid: false, message: 'Data inválida.' };
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (parsed.getTime() > today.getTime()) {
    return { valid: false, message: 'A data não pode ser futura.' };
  }
  return OK;
}

/** Categoria (quando informada) deve ser conhecida. */
export function validateCategory(category: string | undefined): ValidationResult {
  if (!category) return OK; // opcional
  if (!isValidCategory(category)) return { valid: false, message: 'Categoria inválida.' };
  return OK;
}
