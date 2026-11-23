import { addDays, fromISO, toISO, today } from './dates';
import { emptyState, newEvent } from './logic';
import { newId } from './templates';
import type { AppState, Guest, GuestStatus } from './types';

/** Evento de exemplo mostrado na primeira abertura, marcado como exemplo. */
export function exampleState(): AppState {
  const s = emptyState();
  const date = toISO(addDays(today(), 420));
  const ev = newEvent(s, { type: 'casamento', name: 'Casamento (exemplo)', date, guests: 120, kids: 10, budget: 60000, example: true });
  ev.tasks.forEach((t, i) => {
    if (t.p === 'm12' && i % 2 === 0) t.done = true;
  });
  const g = (n: string, gr: string, a: number, k: number, st: GuestStatus, mesa = '', obs = ''): Guest => ({ id: newId(), n, g: gr, a, k, ph: '', st, mesa, obs });
  ev.gl = [
    g('Família Souza', 'Família da noiva', 4, 1, 'sim', '1'),
    g('Família Almeida', 'Família do noivo', 3, 0, 'sim', '2'),
    g('Tia Helena', 'Família da noiva', 1, 0, 'pend'),
    g('Carla e Rafael', 'Padrinhos', 2, 0, 'sim', '1'),
    g('Turma da faculdade', 'Amigos', 6, 0, 'pend'),
    g('Equipe do escritório', 'Trabalho', 5, 0, 'nao'),
    g('Família Lima', 'Família do noivo', 2, 2, 'pend', '', 'Uma criança com alergia a amendoim'),
  ];
  const ev0 = fromISO(date), t0 = today();
  const p = (d: string, v: number, due: Date, paid: boolean) => ({ id: newId(), d, v, due: toISO(due), paid });
  ev.vd = [
    { id: newId(), n: 'Espaço Jardim (exemplo)', cat: 'Local', st: 'ok', ct: '(11) 90000-0000', total: 12000, notes: 'Inclui mesas, cadeiras e estacionamento.', pay: [p('Sinal', 3600, t0, true), p('Saldo', 8400, addDays(ev0, -30), false)] },
    { id: newId(), n: 'Buffet Sabor (exemplo)', cat: 'Buffet', st: 'ok', ct: '@buffetsabor', total: 21000, notes: '120 adultos, cardápio 2. Degustação incluída.', pay: [p('Sinal', 6300, addDays(t0, -3), true), p('Parcela 1', 4900, addDays(t0, 27), false), p('Parcela 2', 4900, addDays(t0, 57), false), p('Parcela 3', 4900, addDays(t0, 87), false)] },
    { id: newId(), n: 'Buffet Mesa Farta (exemplo)', cat: 'Buffet', st: 'desc', ct: '', total: 24500, notes: 'Mais caro e sem degustação.', pay: [] },
    { id: newId(), n: 'Estúdio Luz (exemplo)', cat: 'Fotografia', st: 'orc', ct: 'contato@exemplo.com', total: 6500, notes: 'Álbum 30x30 e pré-wedding.', pay: [] },
    { id: newId(), n: 'Banda a definir', cat: 'Música e DJ', st: 'pesq', ct: '', total: 0, notes: '', pay: [] },
  ];
  s.events.push(ev);
  return s;
}
