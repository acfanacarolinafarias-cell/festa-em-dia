import { View } from 'react-native';

import { fmtDate, toISO, today } from '@/domain/dates';
import { money } from '@/domain/logic';
import { brl } from '@/domain/money';
import { CATEGORIES } from '@/domain/templates';
import type { AppEvent } from '@/domain/types';
import { Banner, Button, Card, Chip, Progress, Row, Spacer, Stats, Txt } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

export function BudgetTab({ ev, updateEvent }: { ev: AppEvent; updateEvent: (fn: (e: AppEvent) => void) => void }) {
  const c = useColors();
  const m = money(ev);
  const left = ev.budget - m.total;
  const t0 = toISO(today());

  const byCat: Record<string, number> = {};
  m.contracted.forEach((v) => (byCat[v.cat] = (byCat[v.cat] ?? 0) + v.total));
  m.taskCosts.forEach((t) => {
    const k = CATEGORIES[t.c] ?? t.c;
    byCat[k] = (byCat[k] ?? 0) + t.cost;
  });
  const max = Math.max(1, ...Object.values(byCat));

  const pays = m.contracted.flatMap((v) => v.pay.map((p) => ({ v, p })));
  pays.sort((a, b) => Number(a.p.paid) - Number(b.p.paid) || a.p.due.localeCompare(b.p.due));
  const pendingTotal = pays.filter((x) => !x.p.paid).reduce((a, x) => a + x.p.v, 0);

  return (
    <View style={{ gap: space.md }}>
      <Stats
        items={[
          { value: brl(ev.budget), label: 'orçamento total' },
          { value: brl(m.total), label: 'comprometido' },
          { value: brl(m.paid), label: 'já pago' },
          { value: ev.budget ? brl(Math.abs(left)) : '–', label: left < 0 ? 'acima do orçamento' : 'livre para gastar', tone: ev.budget && left < 0 ? 'bad' : undefined },
        ]}
      />
      {ev.budget ? (
        <View style={{ gap: 6 }}>
          <Progress pct={Math.round((m.total / ev.budget) * 100)} height={10} color={left < 0 ? c.bad : undefined} />
          <Txt v="small" muted>{`${Math.round((m.total / ev.budget) * 100)}% do orçamento já está comprometido (fornecedores contratados + valores lançados nas tarefas).`}</Txt>
        </View>
      ) : (
        <Banner tone="info">Defina o orçamento total em “Editar” para acompanhar quanto ainda pode gastar.</Banner>
      )}

      <Card>
        <Row>
          <Txt v="h3">Próximos pagamentos</Txt>
          <Spacer />
          <Txt v="small" muted>{brl(pendingTotal)} a pagar</Txt>
        </Row>
        {pays.length === 0 ? (
          <Txt muted>Nenhum pagamento cadastrado. Na aba Fornecedores, marque um fornecedor como Contratado e adicione as parcelas.</Txt>
        ) : (
          pays.map(({ v, p }) => {
            const late = !p.paid && p.due < t0;
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, borderTopWidth: 1, borderColor: c.line, paddingTop: space.sm, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 160, gap: 2 }}>
                  <Txt style={{ fontWeight: '500' }}>{v.n}</Txt>
                  <Row gap={6}>
                    <Txt v="small" muted>{`${p.d} · ${fmtDate(p.due)} · ${brl(p.v)}`}</Txt>
                    {late ? <Chip label="Atrasado" kind="bad" /> : null}
                  </Row>
                </View>
                <Button
                  title={p.paid ? 'Pago ✓' : 'Marcar como pago'}
                  kind={p.paid ? 'ghost' : 'secondary'}
                  small
                  onPress={() =>
                    updateEvent((e) => {
                      const pp = e.vd.find((x) => x.id === v.id)?.pay.find((x) => x.id === p.id);
                      if (pp) pp.paid = !pp.paid;
                    })
                  }
                />
              </View>
            );
          })
        )}
      </Card>

      <Card>
        <Txt v="h3">Por categoria</Txt>
        {Object.keys(byCat).length === 0 ? (
          <Txt muted>Nada lançado ainda. Contrate fornecedores ou preencha o valor nas tarefas do checklist.</Txt>
        ) : (
          Object.entries(byCat)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => (
              <View key={k} style={{ gap: 4 }}>
                <Row>
                  <Txt v="small">{k}</Txt>
                  <Spacer />
                  <Txt v="small" style={{ fontVariant: ['tabular-nums'] }}>{brl(v)}</Txt>
                </Row>
                <Progress pct={Math.round((v / max) * 100)} height={8} />
              </View>
            ))
        )}
      </Card>
    </View>
  );
}
