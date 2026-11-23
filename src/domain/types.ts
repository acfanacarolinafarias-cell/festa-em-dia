export type PhaseId = 'm12' | 'm9' | 'm6' | 'm4' | 'm3' | 'm2' | 'm1' | 's2' | 's1' | 'd1' | 'd0' | 'pos';
export type CategoryId = 'pl' | 'lo' | 'cb' | 'de' | 'cv' | 'fo' | 'rb' | 'do' | 'ce' | 'dd' | 'po';
export type GuestStatus = 'pend' | 'sim' | 'nao';
export type VendorStatus = 'pesq' | 'orc' | 'ok' | 'desc';

/** Uma tarefa dentro de um modelo (checklist padrão). */
export type TemplateTask = { id: string; t: string; c: CategoryId; p: PhaseId };

/** Uma tarefa dentro do checklist de um evento. */
export type Task = TemplateTask & {
  /** Prazo no formato AAAA-MM-DD. */
  due: string;
  done: boolean;
  note: string;
  who: string;
  cost: number;
};

export type Guest = {
  id: string;
  n: string;
  g: string;
  a: number;
  k: number;
  ph: string;
  st: GuestStatus;
  mesa: string;
  obs: string;
};

export type Payment = { id: string; d: string; v: number; due: string; paid: boolean };

export type Vendor = {
  id: string;
  n: string;
  cat: string;
  st: VendorStatus;
  ct: string;
  total: number;
  notes: string;
  pay: Payment[];
};

export type AppEvent = {
  id: string;
  type: string;
  name: string;
  /** Data do evento, AAAA-MM-DD. */
  date: string;
  guests: number;
  kids: number;
  budget: number;
  createdAt: string;
  /** Fator de compressão do cronograma (1 = sem compressão). */
  factor: number;
  /** Antecedência em dias que o modelo pede. */
  lead: number;
  example: boolean;
  tasks: Task[];
  gl: Guest[];
  vd: Vendor[];
  rsvpMsg: string;
  mesaCap: number;
};

export type CustomType = { id: string; name: string; lead: number };

export type AppState = {
  v: 1;
  events: AppEvent[];
  /** Modelos editados pelo usuário, por id de tipo. */
  templates: Record<string, TemplateTask[]>;
  customTypes: CustomType[];
};

export type EventType = { id: string; g: string; n: string; lead: number; custom?: boolean };
