import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const nonBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length === 0
    ? { required: true }
    : null;

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;
  if (!/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) return { cpf: true };
  const digits = value.replace(/\D/g, '');
  if (/^(\d)\1{10}$/.test(digits)) return { cpf: true };
  for (const size of [9, 10]) {
    const sum = [...digits.slice(0, size)].reduce(
      (total, digit, index) => total + Number(digit) * (size + 1 - index),
      0,
    );
    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(digits[size])) return { cpf: true };
  }
  return null;
};

export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;
  // DDD, espaço opcional e hífen opcional antes dos últimos quatro dígitos.
  if (!/^(?:\d{2}|\(\d{2}\)) ?\d{4,5}-?\d{4}$/.test(value)) return { phone: true };
  return /^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(value.replace(/\D/g, '')) ? null : { phone: true };
};
