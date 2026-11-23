import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { daysLabel, fmtLong } from '@/domain/dates';
import { eventStats, guestTotals, latePayments, money, typeOf } from '@/domain/logic';
import { brl } from '@/domain/money';
import { BudgetTab } from '@/features/budget';
import { CalculatorTab } from '@/features/calculator';
import { ChecklistTab } from '@/features/checklist';
import { GuestsTab } from '@/features/guests';
import { VendorsTab } from '@/features/vendors';
import { useEvent } from '@/store/app-store';
import { Banner, Button, Chip, Empty, Progress, Row, Screen, Stats, Tabs, Txt } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

type Tab = 'checklist' | 'convidados' | 'fornecedores' | 'orcamento' | 'calc';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ev, updateEvent, state, update } = useEvent(id);
  const [tab, setTab] = useState<Tab>('checklist');
  const navigation = useNavigation();
  const c = useColors();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: ev?.name ?? 'Evento',
      headerRight: ev
        ? () => (
            <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push({ pathname: '/evento/[id]/editar', params: { id: ev.id } })}>
              <Text style={{ color: c.accent, fontSize: 16, fontWeight: '600' }}>Editar</Text>
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, ev?.name, ev?.id, c.accent, ev]);

  if (!ev)
    return (
      <Screen>
        <Empty title="Evento não encontrado" text="Ele pode ter sido excluído." action={<Button title="Voltar" onPress={() => router.back()} />} />
      </Screen>
    );

  const s = eventStats(ev);
  const G = guestTotals(ev);
  const m = money(ev);
  const late = latePayments(ev);

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Row>
          <Txt v="eyebrow">{typeOf(state, ev.type).n}</Txt>
          {ev.example ? <Chip label="Exemplo" kind="example" /> : null}
        </Row>
        <Txt v="title">{ev.name}</Txt>
        <Txt muted>{`${fmtLong(ev.date)} · ${daysLabel(s.days)}`}</Txt>
      </View>
      <Progress pct={s.pct} height={8} />
      <Stats
        items={[
          { value: `${s.pct}%`, label: `${s.done} de ${s.total} tarefas` },
          { value: String(s.late), label: 'tarefas atrasadas', tone: s.late ? 'bad' : undefined },
          ev.gl.length ? { value: `${G.confirmed}/${G.invited - G.declined}`, label: 'pessoas confirmadas' } : { value: String(ev.guests + ev.kids), label: 'convidados previstos' },
          ev.budget ? { value: `${Math.round((m.total / ev.budget) * 100)}%`, label: 'do orçamento comprometido' } : { value: brl(m.total), label: 'comprometido' },
        ]}
      />
      {ev.factor < 1 ? <Banner>{`Cronograma comprimido: o modelo pede ${ev.lead} dias e o evento foi criado com menos tempo. Os prazos foram ajustados para caber.`}</Banner> : null}
      {late.length ? (
        <Banner>
          <Txt v="small">{`${late.length} pagamento${late.length > 1 ? 's' : ''} de fornecedor atrasado${late.length > 1 ? 's' : ''}: ${late.slice(0, 3).map((x) => `${x.vendor.n} (${brl(x.payment.v)})`).join(', ')}.`}</Txt>
          <View style={{ alignItems: 'flex-start' }}>
            <Button title="Ver pagamentos" small onPress={() => setTab('orcamento')} />
          </View>
        </Banner>
      ) : null}

      <Tabs<Tab> value={tab} onChange={setTab} options={[['checklist', 'Checklist'], ['convidados', 'Convidados'], ['fornecedores', 'Fornecedores'], ['orcamento', 'Orçamento'], ['calc', 'Calculadora']]} />

      <View style={{ gap: space.md }}>
        {tab === 'checklist' ? <ChecklistTab ev={ev} state={state} updateEvent={updateEvent} update={update} /> : null}
        {tab === 'convidados' ? <GuestsTab ev={ev} updateEvent={updateEvent} /> : null}
        {tab === 'fornecedores' ? <VendorsTab ev={ev} updateEvent={updateEvent} /> : null}
        {tab === 'orcamento' ? <BudgetTab ev={ev} updateEvent={updateEvent} /> : null}
        {tab === 'calc' ? <CalculatorTab key={`${ev.guests}-${ev.kids}-${ev.gl.length}`} ev={ev} /> : null}
      </View>
    </Screen>
  );
}
