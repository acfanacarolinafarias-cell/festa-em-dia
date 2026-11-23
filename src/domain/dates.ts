const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};
/** Diferença em dias inteiros (a - b). */
export const diffDays = (a: Date, b: Date) => Math.round((fromISO(toISO(a)).getTime() - fromISO(toISO(b)).getTime()) / 864e5);

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

// Formatação manual: Intl em pt-BR não é garantido em todos os motores JS do celular.
export const fmtDate = (s: string) => {
  const d = fromISO(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtShort = (s: string) => {
  const d = fromISO(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const fmtLong = (s: string) => {
  const d = fromISO(s);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]} de ${d.getFullYear()}`;
};
/** DD/MM/AAAA, para campos digitados. */
export const fmtInput = (s: string) => {
  const d = fromISO(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
/** Aceita DD/MM/AAAA; devolve AAAA-MM-DD ou null. */
export const parseInput = (s: string): string | null => {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  if (d.getDate() !== +m[1] || d.getMonth() !== +m[2] - 1) return null;
  return toISO(d);
};

export const daysLabel = (d: number) => {
  if (d > 1) return `faltam ${d} dias`;
  if (d === 1) return 'é amanhã';
  if (d === 0) return 'é hoje';
  return `aconteceu há ${-d} dia${d === -1 ? '' : 's'}`;
};

/** "12 meses antes", "3 meses antes", "4 semanas antes". */
export const leadText = (d: number) => {
  if (d >= 330) return '12 meses antes';
  if (d >= 60) return `${Math.round(d / 30)} meses antes`;
  return `${Math.round(d / 7)} semanas antes`;
};
