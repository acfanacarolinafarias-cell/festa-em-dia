import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { fromISO } from '@/domain/dates';
import { dueFor } from '@/domain/logic';
import { parseMoney } from '@/domain/money';
import { CATEGORIES, PHASES, newId } from '@/domain/templates';
import type { CategoryId, PhaseId, Task } from '@/domain/types';
import { useEvent } from '@/store/app-store';
import { DateField } from '@/ui/date-field';
import { Button, Checkbox, ConfirmButton, Field, FormGrid, Row, Screen, Select, Txt } from '@/ui/kit';
import { space } from '@/ui/theme';

export default function TaskScreen() {
  const { id, taskId, fase } = useLocalSearchParams<{ id: string; taskId: string; fase?: PhaseId }>();
  const { ev, updateEvent } = useEvent(id);
  const isNew = taskId === 'nova';
  const existing = ev?.tasks.find((t) => t.id === taskId);
  const initialPhase: PhaseId = existing?.p ?? fase ?? 'm1';
  const [draft, setDraft] = useState<Task | null>(() =>
    existing
      ? { ...existing }
      : ev
        ? { id: newId(), t: '', c: 'pl', p: initialPhase, due: dueFor(initialPhase, fromISO(ev.date), ev.factor), done: false, note: '', who: '', cost: 0 }
        : null,
  );
  const [cost, setCost] = useState(existing?.cost ? String(existing.cost) : '');
  if (!ev || !draft) return null;
  const set = (patch: Partial<Task>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = () => {
    const t: Task = { ...draft, t: draft.t.trim() || 'Nova tarefa', cost: parseMoney(cost) };
    updateEvent((e) => {
      if (isNew) e.tasks.push(t);
      else e.tasks = e.tasks.map((x) => (x.id === t.id ? t : x));
    });
    router.back();
  };

  return (
    <Screen>
      <Field label="Tarefa" value={draft.t} onChangeText={(t) => set({ t })} placeholder="Ex.: Reservar o salão" autoFocus={isNew} />
      <FormGrid>
        <Select<PhaseId>
          label="Etapa"
          value={draft.p}
          // Ao trocar a etapa, o prazo acompanha; ele ainda pode ser ajustado à mão.
          onChange={(p) => set({ p, due: dueFor(p, fromISO(ev.date), ev.factor) })}
          options={PHASES.map((p) => [p.id, p.label])}
        />
        <DateField label="Prazo" value={draft.due} onChange={(due) => set({ due })} />
        <Select<CategoryId> label="Categoria" value={draft.c} onChange={(c) => set({ c })} options={Object.entries(CATEGORIES) as [CategoryId, string][]} />
        <Field label="Responsável" value={draft.who} onChangeText={(who) => set({ who })} placeholder="Ex.: Mãe, padrinho" />
        <Field label="Valor (R$)" value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="0" />
      </FormGrid>
      <Field label="Anotações" value={draft.note} onChangeText={(note) => set({ note })} multiline placeholder="Contato do fornecedor, link, ideias…" />
      <Row>
        <Checkbox checked={draft.done} onPress={() => set({ done: !draft.done })} label="Tarefa concluída" />
        <Txt>Concluída</Txt>
      </Row>
      <Button title="Salvar" kind="primary" onPress={save} />
      {!isNew ? (
        <View style={{ marginTop: space.lg }}>
          <ConfirmButton
            title="Excluir tarefa"
            confirmText="Excluir esta tarefa do checklist do evento?"
            onConfirm={() => {
              updateEvent((e) => {
                e.tasks = e.tasks.filter((x) => x.id !== draft.id);
              });
              router.back();
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}
