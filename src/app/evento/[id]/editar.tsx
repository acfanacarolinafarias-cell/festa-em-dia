import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';

import { addDays, diffDays, fromISO, toISO } from '@/domain/dates';
import { intOr0, parseMoney } from '@/domain/money';
import { useEvent } from '@/store/app-store';
import { DateField } from '@/ui/date-field';
import { Button, ConfirmButton, Field, FormGrid, Row, Screen, Txt } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ev, updateEvent, update } = useEvent(id);
  const c = useColors();
  const [name, setName] = useState(ev?.name ?? '');
  const [date, setDate] = useState(ev?.date ?? toISO(new Date()));
  const [guests, setGuests] = useState(String(ev?.guests ?? 0));
  const [kids, setKids] = useState(String(ev?.kids ?? 0));
  const [budget, setBudget] = useState(ev?.budget ? String(ev.budget) : '');
  const [recalc, setRecalc] = useState(true);
  if (!ev) return null;

  const save = () => {
    updateEvent((e) => {
      e.name = name.trim() || e.name;
      e.guests = intOr0(guests);
      e.kids = intOr0(kids);
      e.budget = parseMoney(budget);
      if (date !== e.date) {
        if (recalc) {
          const shift = diffDays(fromISO(date), fromISO(e.date));
          e.tasks.forEach((t) => {
            if (!t.done) t.due = toISO(addDays(fromISO(t.due), shift));
          });
        }
        e.date = date;
      }
      e.example = false;
    });
    router.back();
  };

  return (
    <Screen>
      <FormGrid>
        <Field label="Nome" value={name} onChangeText={setName} />
        <DateField label="Data" value={date} onChange={setDate} />
        <Field label="Adultos" value={guests} onChangeText={setGuests} keyboardType="number-pad" />
        <Field label="Crianças" value={kids} onChangeText={setKids} keyboardType="number-pad" />
        <Field label="Orçamento (R$)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" />
      </FormGrid>
      <Row>
        <Switch value={recalc} onValueChange={setRecalc} trackColor={{ true: c.accent }} accessibilityLabel="Recalcular prazos" />
        <Txt v="small" style={{ flex: 1 }}>Se a data mudar, mover os prazos das tarefas pendentes junto</Txt>
      </Row>
      <Button title="Salvar" kind="primary" onPress={save} />
      <View style={{ marginTop: space.xl }}>
        <ConfirmButton
          title="Excluir evento"
          confirmText={`Excluir “${ev.name}” com checklist, convidados e fornecedores? Não dá para desfazer.`}
          onConfirm={() => {
            update((s) => {
              s.events = s.events.filter((x) => x.id !== ev.id);
            });
            router.dismissAll();
          }}
        />
      </View>
    </Screen>
  );
}
