import { addDays, diffDays, fmtDate, fmtLong, fromISO, toISO, today } from './dates';
import { BUILT_IN_TYPES, DEFAULT_TEMPLATES, PHASE_BY_ID, newId } from './templates';
import type { AppEvent, AppState, EventType, Guest, PhaseId, Task, TemplateTask, Vendor } from './types';

/* ---------- Tipos e modelos ---------- */

export function allTypes(state: AppState): EventType[] {
  return [
    ...BUILT_IN_TYPES.map(({ id, g, n, lead }) => ({ id, g, n, lead })),
    ...state.customTypes.map((c) => ({ id: c.id, g: 'Meus modelos', n: c.name, lead: c.lead, custom: true })),
  ];
}
export function typeOf(state: AppState, id: string): EventType {
  return allTypes(state).find((t) => t.id === id) ?? allTypes(state).find((t) => t.id === 'livre')!;
}
export function getTemplate(state: AppState, typeId: string): TemplateTask[] {
  const list = state.templates[typeId] ?? DEFAULT_TEMPLATES[typeId] ?? [];
  return list.map((x) => ({ ...x }));
}
export const isTemplateEdited = (state: AppState, typeId: string) => !!state.templates[typeId] && !!DEFAULT_TEMPLATES[typeId];

/* ---------- Cronograma ---------- */

/** Prazo de uma etapa, aplicando o fator de compressão. */
export function dueFor(p: PhaseId, eventDate: Date, factor: number) {
  const d = PHASE_BY_ID[p].days;
  return toISO(addDays(eventDate, d > 0 ? -Math.round(d * factor) : -d));
}

/** Gera as tarefas do evento. Se houver menos tempo do que o modelo pede, comprime os prazos proporcionalmente. */
export function buildTasks(tpl: TemplateTask[], dateISO: string) {
  const ev = fromISO(dateISO);
  const avail = diffDays(ev, today());
  const maxD = Math.max(1, ...tpl.map((x) => PHASE_BY_ID[x.p].days));
  const factor = avail >= maxD ? 1 : Math.max(0, avail) / maxD;
  const tasks: Task[] = tpl.map((x) => ({ id: newId(), t: x.t, c: x.c, p: x.p, due: dueFor(x.p, ev, factor), done: false, note: '', who: '', cost: 0 }));
  return { tasks, factor, avail, maxD };
}

export function newEvent(state: AppState, input: { type: string; name: string; date: string; guests: number; kids: number; budget: number; example?: boolean }): AppEvent {
  const b = buildTasks(getTemplate(state, input.type), input.date);
  return {
    id: newId(), type: input.type, name: input.name, date: input.date, guests: input.guests, kids: input.kids, budget: input.budget,
    createdAt: toISO(today()), factor: b.factor, lead: b.maxD, example: !!input.example, tasks: b.tasks,
    gl: [], vd: [], rsvpMsg: '', mesaCap: 10,
  };
}

export function eventStats(ev: AppEvent) {
  const t0 = toISO(today());
  const total = ev.tasks.length;
  const done = ev.tasks.filter((t) => t.done).length;
  const late = ev.tasks.filter((t) => !t.done && t.due < t0).length;
  const days = diffDays(fromISO(ev.date), today());
  return { total, done, late, days, pct: total ? Math.round((done / total) * 100) : 0 };
}

export type TaskBadge = { kind: 'bad' | 'warn'; label: string } | null;
export function taskBadge(t: Task): TaskBadge {
  if (t.done) return null;
  const d = diffDays(fromISO(t.due), today());
  if (d < 0) return { kind: 'bad', label: 'Atrasada' };
  if (d === 0) return { kind: 'warn', label: 'Hoje' };
  if (d <= 7) return { kind: 'warn', label: `Em ${d} dia${d === 1 ? '' : 's'}` };
  return null;
}

/* ---------- Dinheiro ---------- */

export const vendorPaid = (v: Vendor) => v.pay.filter((p) => p.paid).reduce((a, p) => a + p.v, 0);
export const vendorNext = (v: Vendor) => [...v.pay].filter((p) => !p.paid).sort((a, b) => a.due.localeCompare(b.due))[0];

export function money(ev: AppEvent) {
  const contracted = ev.vd.filter((v) => v.st === 'ok');
  const vendorTotal = contracted.reduce((a, v) => a + v.total, 0);
  const vendorPaidTotal = contracted.reduce((a, v) => a + vendorPaid(v), 0);
  const taskCosts = ev.tasks.filter((t) => t.cost > 0);
  const taskTotal = taskCosts.reduce((a, t) => a + t.cost, 0);
  const taskPaid = taskCosts.filter((t) => t.done).reduce((a, t) => a + t.cost, 0);
  return { contracted, taskCosts, vendorTotal, taskTotal, total: vendorTotal + taskTotal, paid: vendorPaidTotal + taskPaid };
}

export function latePayments(ev: AppEvent) {
  const t0 = toISO(today());
  return ev.vd.filter((v) => v.st === 'ok').flatMap((v) => v.pay.filter((p) => !p.paid && p.due < t0).map((p) => ({ vendor: v, payment: p })));
}

/** Divide o valor que falta em parcelas mensais (a última absorve o arredondamento). */
export function splitInstallments(v: Vendor, n: number, firstDue: string) {
  const rest = Math.max(0, v.total - v.pay.reduce((a, p) => a + p.v, 0));
  if (!rest || n < 1) return [];
  const each = Math.floor((rest / n) * 100) / 100;
  const start = v.pay.filter((p) => /^Parcela/.test(p.d)).length;
  const base = fromISO(firstDue);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    return { id: newId(), d: `Parcela ${start + i + 1}`, v: i === n - 1 ? Math.round((rest - each * (n - 1)) * 100) / 100 : each, due: toISO(d), paid: false };
  });
}

/* ---------- Convidados ---------- */

export function guestTotals(ev: AppEvent) {
  const r = { adults: 0, kids: 0, confirmed: 0, pending: 0, declined: 0, invited: 0 };
  for (const g of ev.gl) {
    const n = g.a + g.k;
    r.invited += n;
    if (g.st === 'sim') r.confirmed += n;
    else if (g.st === 'nao') r.declined += n;
    else r.pending += n;
    if (g.st !== 'nao') {
      r.adults += g.a;
      r.kids += g.k;
    }
  }
  return r;
}
export const peopleLabel = (g: Pick<Guest, 'a' | 'k'>) =>
  [g.a ? `${g.a} adulto${g.a > 1 ? 's' : ''}` : '', g.k ? `${g.k} criança${g.k > 1 ? 's' : ''}` : ''].filter(Boolean).join(', ') || '0 pessoas';

/** Lê linhas "nome; grupo; adultos; crianças; telefone". */
export function parseGuestLines(text: string): Guest[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [n, g, a, k, ph] = l.split(/[;\t]/).map((x) => (x ?? '').trim());
      return { id: newId(), n: n || 'Convidado', g: g || '', a: a === '' || a === undefined ? 1 : Math.max(0, parseInt(a, 10) || 0), k: Math.max(0, parseInt(k ?? '', 10) || 0), ph: ph || '', st: 'pend', mesa: '', obs: '' };
    });
}

export const DEFAULT_RSVP_MESSAGE = 'Olá, {nome}! Você é nosso convidado para {evento}, {data}. Pode confirmar sua presença até {prazo}? É só responder SIM ou NÃO. Obrigado!';

export function rsvpDeadline(ev: AppEvent) {
  const d = fromISO(ev.date);
  const x = addDays(d, -30);
  return toISO(x < today() ? addDays(d, -Math.max(1, Math.floor(diffDays(d, today()) / 2))) : x);
}
export function fillMessage(ev: AppEvent, g?: Guest) {
  return (ev.rsvpMsg || DEFAULT_RSVP_MESSAGE)
    .split('{nome}').join(g ? g.n : 'Maria')
    .split('{evento}').join(ev.name)
    .split('{data}').join(fmtLong(ev.date))
    .split('{prazo}').join(fmtDate(rsvpDeadline(ev)));
}
export function whatsappUrl(phone: string, text: string) {
  let d = phone.replace(/\D/g, '');
  if (!d) return '';
  if (d.length <= 11) d = '55' + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

/* ---------- Calculadora ---------- */

export type CalcInput = { adults: number; kids: number; hours: number; kind: 'festa' | 'churrasco'; alcohol: number };
export function calcDefaults(ev: AppEvent): CalcInput {
  const t = guestTotals(ev);
  const useList = ev.gl.length > 0;
  return {
    adults: useList ? t.adults : ev.guests,
    kids: useList ? t.kids : ev.kids,
    hours: /casamento|aniv15|formatura/.test(ev.type) ? 6 : 4,
    kind: /casanova|adulto|despedida/.test(ev.type) ? 'churrasco' : 'festa',
    alcohol: 50,
  };
}
export function computeCalc(c: CalcInput) {
  const A = Math.max(0, c.adults), K = Math.max(0, c.kids), H = Math.max(1, c.hours);
  const drinkers = (A * Math.min(100, Math.max(0, c.alcohol))) / 100;
  const hf = H / 4, P = A + K;
  const n = (x: number) => Math.ceil(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const out: { value: string; label: string }[] = [];
  if (c.kind === 'churrasco') {
    out.push({ value: `${n(A * 0.4 + K * 0.2)} kg`, label: 'de carne (400 g por adulto, 200 g por criança)' });
    out.push({ value: `${n(A * 0.1 + K * 0.05)} kg`, label: 'de linguiça e frango para a entrada' });
    out.push({ value: `${n(P * 0.1)} kg`, label: 'de pão de alho e acompanhamentos' });
    out.push({ value: `${n(P * 0.25)} kg`, label: 'de carvão (aprox.)' });
  } else {
    out.push({ value: n((A * 15 + K * 8) * Math.min(1.4, Math.max(0.8, hf))), label: 'salgados (15 por adulto, 8 por criança)' });
    out.push({ value: n(P * 5), label: 'docinhos (5 por pessoa)' });
    out.push({ value: `${n(A * 0.1 + K * 0.07)} kg`, label: 'de bolo (100 g por adulto, 70 g por criança)' });
  }
  out.push({ value: `${n((A * 0.6 + K * 0.4) * hf)} L`, label: 'de refrigerante e suco' });
  out.push({ value: `${n(P * 0.5 * hf)} L`, label: 'de água' });
  if (drinkers > 0) out.push({ value: `${n(drinkers * 2 * hf)} L`, label: `de cerveja (${Math.round(drinkers)} pessoas que bebem)` });
  out.push({ value: `${n(P * 0.5 * hf)} kg`, label: 'de gelo' });
  return out;
}

/* ---------- Estado inicial ---------- */

export function emptyState(): AppState {
  return { v: 1, events: [], templates: {}, customTypes: [] };
}

/** Garante campos novos em dados salvos por versões anteriores. */
export function normalizeState(s: Partial<AppState> | null | undefined): AppState {
  const st: AppState = { ...emptyState(), ...(s ?? {}) } as AppState;
  st.events = (st.events ?? []).map((e) => ({ ...e, gl: e.gl ?? [], vd: e.vd ?? [], rsvpMsg: e.rsvpMsg ?? '', mesaCap: e.mesaCap || 10 }));
  st.templates = st.templates ?? {};
  st.customTypes = st.customTypes ?? [];
  return st;
}
