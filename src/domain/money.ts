/** R$ 12.345 (sem centavos) — formatado à mão para não depender de Intl. */
export const brl = (n: number) => {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${v < 0 ? '-' : ''}R$ ${s}`;
};
/** Lê "12.000", "12000,50" ou "12000.5". */
export const parseMoney = (v: string) => {
  const s = String(v).trim();
  const normalized = s.includes(',') || /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s;
  const n = parseFloat(normalized);
  return isFinite(n) && n > 0 ? n : 0;
};
export const intOr0 = (v: string) => Math.max(0, parseInt(v, 10) || 0);
