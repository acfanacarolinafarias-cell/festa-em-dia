import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { fmtDate, toISO, today } from '@/domain/dates';
import { buildTasks, getTemplate, taskBadge, typeOf } from '@/domain/logic';
import { brl } from '@/domain/money';
import { CATEGORIES, PHASES, newId } from '@/domain/templates';
import type { AppEvent, AppState, CategoryId, PhaseId, Task } from '@/domain/types';
import { Banner, Button, Card, Checkbox, Chip, ConfirmButton, Empty, Pills, Row, SectionHeader, Select, Txt } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

type Filter = 'todas' | 'pendentes' | 'atrasadas' | 'feitas';

export function ChecklistTab({ ev, state, updateEvent, update }: { ev: AppEvent; state: AppState; updateEvent: (fn: (e: AppEvent) => void) => void; update: (fn: (s: AppState) => void) => void }) {
  const [filter, setFilter] = useState<Filter>('todas');
  const [cat, setCat] = useState<CategoryId | ''>('');
  const [savedTpl, setSavedTpl] = useState(false);
  const [extraPhase, setExtraPhase] = useState<PhaseId | ''>('');
  const t0 = toISO(today());
  const typeName = typeOf(state, ev.type).n;

  const match = (t: Task) =>
    (!cat || t.c === cat) &&
    (filter === 'pendentes' ? !t.done : filter === 'atrasadas' ? !t.done && t.due < t0 : filter === 'feitas' ? t.done : true);
  const usedCats = [...new Set(ev.tasks.map((t) => t.c))];
  const emptyPhases = PHASES.filter((p) => !ev.tasks.some((t) => t.p === p.id));
  const openTask = (taskId: string, fase?: PhaseId) =>
    router.push({ pathname: '/evento/[id]/tarefa/[taskId]', params: fase ? { id: ev.id, taskId, fase } : { id: ev.id, taskId } });

  const sections = PHASES.map((p) => {
    const tasks = ev.tasks.filter((t) => t.p === p.id);
    const shown = tasks.filter(match).sort((a, b) => a.due.localeCompare(b.due));
    return { p, tasks, shown };
  }).filter((s) => s.tasks.length && (s.shown.length || (filter === 'todas' && !cat)));

  return (
    <View style={{ gap: space.md }}>
      <Pills<Filter> scroll value={filter} onChange={setFilter} options={[['todas', 'Todas'], ['pendentes', 'Pendentes'], ['atrasadas', 'Atrasadas'], ['feitas', 'Concluídas']]} />
      <Select<CategoryId | ''> label="Categoria" value={cat} onChange={setCat} options={[['', 'Todas as categorias'], ...usedCats.map((c) => [c, CATEGORIES[c]] as [CategoryId, string])]} />

      {sections.length === 0 ? <Empty title="Nada por aqui" text="Nenhuma tarefa com esse filtro." /> : null}
      {sections.map(({ p, tasks, shown }) => {
        const done = tasks.filter((t) => t.done).length;
        const lastDue = tasks.reduce((m, t) => (t.due > m ? t.due : m), '');
        return (
          <View key={p.id}>
            <SectionHeader title={p.label} right={`${p.id === 'pos' ? 'após ' + fmtDate(ev.date) : 'até ' + fmtDate(lastDue)} · ${done}/${tasks.length}`} />
            {shown.map((t) => (
              <TaskRow key={t.id} t={t} onToggle={() => updateEvent((e) => { const x = e.tasks.find((y) => y.id === t.id); if (x) x.done = !x.done; })} onOpen={() => openTask(t.id)} />
            ))}
            <View style={{ alignItems: 'flex-start', paddingVertical: 4 }}>
              <Button title="+ Adicionar tarefa" kind="ghost" small onPress={() => openTask('nova', p.id)} />
            </View>
          </View>
        );
      })}

      <Card>
        <Txt v="h3">Personalizar este checklist</Txt>
        <Txt v="small" muted>Toque em uma tarefa para editar texto, prazo, responsável e valor. Para mudar o padrão dos próximos eventos, use a aba Modelos.</Txt>
        {emptyPhases.length ? (
          <Row>
            <View style={{ flexGrow: 1, flexBasis: 180 }}>
              <Select<PhaseId | ''> label="Tarefa em outra etapa" value={extraPhase} onChange={setExtraPhase} options={[['', 'Escolha a etapa'], ...emptyPhases.map((p) => [p.id, p.label] as [PhaseId, string])]} />
            </View>
            <Button title="Adicionar" small disabled={!extraPhase} onPress={() => extraPhase && openTask('nova', extraPhase)} />
          </Row>
        ) : null}
        <Button
          title={`Salvar como modelo padrão de ${typeName}`}
          small
          onPress={() => {
            update((s) => {
              s.templates[ev.type] = ev.tasks.map((t) => ({ id: newId(), t: t.t, c: t.c, p: t.p }));
            });
            setSavedTpl(true);
          }}
        />
        {savedTpl ? <Banner tone="info">{`Pronto. Os próximos eventos de ${typeName} vão começar com estas ${ev.tasks.length} tarefas.`}</Banner> : null}
        <ConfirmButton
          title="Restaurar checklist do modelo"
          confirmText="Trocar todas as tarefas pelas do modelo atual? As marcações e anotações serão perdidas."
          onConfirm={() =>
            updateEvent((e) => {
              const b = buildTasks(getTemplate(state, e.type), e.date);
              e.tasks = b.tasks;
              e.factor = b.factor;
              e.lead = b.maxD;
            })
          }
        />
      </Card>
    </View>
  );
}

function TaskRow({ t, onToggle, onOpen }: { t: Task; onToggle: () => void; onOpen: () => void }) {
  const c = useColors();
  const badge = taskBadge(t);
  return (
    <View style={{ flexDirection: 'row', gap: space.md, paddingVertical: space.md, borderBottomWidth: 1, borderColor: c.line, alignItems: 'flex-start' }}>
      <View style={{ paddingTop: 1 }}>
        <Checkbox checked={t.done} onPress={onToggle} label={`Concluir: ${t.t}`} />
      </View>
      <Pressable accessibilityRole="button" accessibilityHint="Abre a tarefa para editar" onPress={onOpen} style={{ flex: 1, gap: 4 }}>
        <Txt style={{ fontWeight: '500', textDecorationLine: t.done ? 'line-through' : 'none', color: t.done ? c.muted : c.text }}>{t.t}</Txt>
        <Row gap={6}>
          <Chip label={CATEGORIES[t.c] ?? t.c} />
          <Txt v="small" muted>{fmtDate(t.due)}</Txt>
          {badge ? <Chip label={badge.label} kind={badge.kind} /> : null}
          {t.who ? <Txt v="small" muted>· {t.who}</Txt> : null}
          {t.cost ? <Txt v="small" muted>· {brl(t.cost)}</Txt> : null}
        </Row>
        {t.note ? <Txt v="small" muted numberOfLines={3}>{t.note}</Txt> : null}
      </Pressable>
    </View>
  );
}
