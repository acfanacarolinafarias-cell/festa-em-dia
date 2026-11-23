import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { addDays, diffDays, fromISO, leadText, toISO, today } from '@/domain/dates';
import { allTypes, getTemplate, newEvent, typeOf } from '@/domain/logic';
import { intOr0, parseMoney } from '@/domain/money';
import { PHASE_BY_ID } from '@/domain/templates';
import { useStore } from '@/store/app-store';
import { DateField } from '@/ui/date-field';
import { Banner, Button, Field, FormGrid, Screen, Txt } from '@/ui/kit';
import { radius, space, useColors } from '@/ui/theme';

const KID_EVENTS = /aniv1|infantil|chabebe|batizado/;

export default function NewEventScreen() {
  const { state } = useStore();
  const c = useColors();
  const params = useLocalSearchParams<{ tipo?: string }>();
  const [typeId, setTypeId] = useState<string | null>(params.tipo ?? null);

  if (!typeId) {
    const groups: Record<string, ReturnType<typeof allTypes>> = {};
    allTypes(state).forEach((t) => (groups[t.g] = groups[t.g] ?? []).push(t));
    return (
      <Screen>
        <View>
          <Txt v="eyebrow">Passo 1 de 2</Txt>
          <Txt v="title">Qual é o evento?</Txt>
          <Txt muted>Cada tipo vem com um checklist pronto. Você pode mudar tudo depois.</Txt>
        </View>
        {Object.entries(groups).map(([g, types]) => (
          <View key={g} style={{ gap: space.sm }}>
            <Txt v="h3">{g}</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {types.map((t) => (
                <Pressable
                  key={t.id}
                  accessibilityRole="button"
                  onPress={() => setTypeId(t.id)}
                  style={({ pressed }) => ({ flexGrow: 1, flexBasis: 150, backgroundColor: c.surface, borderWidth: 1, borderColor: pressed ? c.accent : c.line, borderRadius: radius, padding: space.md, gap: 2 })}>
                  <Txt v="h3">{t.n}</Txt>
                  <Txt v="small" muted>{getTemplate(state, t.id).length} tarefas · começar {leadText(t.lead)}</Txt>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </Screen>
    );
  }
  return <NewEventForm typeId={typeId} onBack={() => setTypeId(null)} />;
}

function NewEventForm({ typeId, onBack }: { typeId: string; onBack: () => void }) {
  const { state, update } = useStore();
  const t = typeOf(state, typeId);
  const [name, setName] = useState(t.n);
  const [date, setDate] = useState(toISO(addDays(today(), t.lead || 60)));
  const [guests, setGuests] = useState('80');
  const [kids, setKids] = useState(KID_EVENTS.test(typeId) ? '20' : '0');
  const [budget, setBudget] = useState('');

  const tpl = getTemplate(state, typeId);
  const maxD = Math.max(1, ...tpl.map((x) => PHASE_BY_ID[x.p].days));
  const avail = diffDays(fromISO(date), today());

  const create = () => {
    if (avail < 0) return;
    const ev = newEvent(state, { type: typeId, name: name.trim() || t.n, date, guests: intOr0(guests), kids: intOr0(kids), budget: parseMoney(budget) });
    update((s) => {
      s.events.push(ev);
    });
    router.replace({ pathname: '/evento/[id]', params: { id: ev.id } });
  };

  return (
    <Screen>
      <View style={{ alignItems: 'flex-start' }}>
        <Button title="← Trocar tipo" kind="ghost" small onPress={onBack} />
      </View>
      <View>
        <Txt v="eyebrow">Passo 2 de 2 · {t.n}</Txt>
        <Txt v="title">Conte um pouco sobre o evento</Txt>
      </View>
      <FormGrid>
        <Field label="Nome do evento" value={name} onChangeText={setName} />
        <DateField label="Data" value={date} onChange={setDate} />
        <Field label="Convidados adultos" value={guests} onChangeText={setGuests} keyboardType="number-pad" />
        <Field label="Crianças" value={kids} onChangeText={setKids} keyboardType="number-pad" />
        <Field label="Orçamento total (R$)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" placeholder="Ex.: 30000" />
      </FormGrid>
      {avail < 0 ? (
        <Banner>Essa data já passou. Escolha uma data futura.</Banner>
      ) : avail < maxD ? (
        <Banner>{`Você tem ${avail} dias, e o modelo foi pensado para ${maxD}. Vamos comprimir o cronograma: as ${tpl.length} tarefas cabem no tempo que você tem, mas algumas ficam com prazo curto.`}</Banner>
      ) : (
        <Banner tone="info">{`O checklist terá ${tpl.length} tarefas, começando ${leadText(maxD)} do evento.`}</Banner>
      )}
      <Button title="Criar checklist" kind="primary" onPress={create} disabled={avail < 0} />
    </Screen>
  );
}
