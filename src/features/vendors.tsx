import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { diffDays, fmtDate, fromISO, toISO, today } from '@/domain/dates';
import { vendorNext, vendorPaid } from '@/domain/logic';
import { brl } from '@/domain/money';
import { VENDOR_CATEGORIES, VENDOR_STATUS } from '@/domain/templates';
import type { AppEvent, Vendor, VendorStatus } from '@/domain/types';
import { Button, Chip, Empty, Pills, Progress, Row, SectionHeader, Select, Stats, Txt } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

type Filter = 'todos' | VendorStatus;

export function VendorsTab({ ev, updateEvent }: { ev: AppEvent; updateEvent: (fn: (e: AppEvent) => void) => void }) {
  const [filter, setFilter] = useState<Filter>('todos');
  const contracted = ev.vd.filter((v) => v.st === 'ok');
  const total = contracted.reduce((a, v) => a + v.total, 0);
  const paid = contracted.reduce((a, v) => a + vendorPaid(v), 0);
  const list = ev.vd.filter((v) => filter === 'todos' || v.st === filter);
  const groups: Record<string, Vendor[]> = {};
  list.forEach((v) => (groups[v.cat] = groups[v.cat] ?? []).push(v));
  const order = (c: string) => {
    const i = VENDOR_CATEGORIES.indexOf(c);
    return i < 0 ? 99 : i;
  };

  return (
    <View style={{ gap: space.md }}>
      <Stats
        items={[
          { value: String(contracted.length), label: `contratados de ${ev.vd.length}` },
          { value: brl(total), label: 'em contratos' },
          { value: brl(paid), label: 'já pago' },
          { value: brl(total - paid), label: 'falta pagar' },
        ]}
      />
      <Button title="+ Adicionar fornecedor" kind="primary" onPress={() => router.push({ pathname: '/evento/[id]/fornecedor/[vendorId]', params: { id: ev.id, vendorId: 'novo' } })} />
      <Pills<Filter> scroll value={filter} onChange={setFilter} options={[['todos', 'Todos'], ['pesq', 'Pesquisando'], ['orc', 'Orçamento'], ['ok', 'Contratados'], ['desc', 'Descartados']]} />
      {ev.vd.length === 0 ? <Empty title="Nenhum fornecedor ainda" text="Cadastre os orçamentos que você receber para comparar preços e, depois de contratar, acompanhar as parcelas." /> : null}
      {Object.entries(groups)
        .sort((a, b) => order(a[0]) - order(b[0]))
        .map(([cat, vs]) => (
          <View key={cat}>
            <SectionHeader title={cat} right={vs.length > 1 ? `${vs.length} opções` : undefined} />
            {vs.map((v) => (
              <VendorRow key={v.id} ev={ev} v={v} siblings={vs} updateEvent={updateEvent} />
            ))}
          </View>
        ))}
      <Txt v="small" muted>Ao marcar um fornecedor como Contratado, o valor dele entra no orçamento e as parcelas aparecem em Orçamento → Próximos pagamentos.</Txt>
    </View>
  );
}

function VendorRow({ ev, v, siblings, updateEvent }: { ev: AppEvent; v: Vendor; siblings: Vendor[]; updateEvent: (fn: (e: AppEvent) => void) => void }) {
  const c = useColors();
  const paid = vendorPaid(v);
  const next = vendorNext(v);
  const t0 = toISO(today());
  const priced = siblings.filter((x) => x.st !== 'desc' && x.total > 0);
  const cheapest = priced.length > 1 && v.st !== 'desc' && v.total > 0 && v.total === Math.min(...priced.map((x) => x.total));
  return (
    <View style={{ paddingVertical: space.md, borderBottomWidth: 1, borderColor: c.line, gap: space.sm }}>
      <Pressable accessibilityRole="button" accessibilityHint="Abre o fornecedor para editar" onPress={() => router.push({ pathname: '/evento/[id]/fornecedor/[vendorId]', params: { id: ev.id, vendorId: v.id } })} style={{ gap: 4 }}>
        <Row gap={6}>
          <Txt style={{ fontWeight: '500' }}>{v.n}</Txt>
          {cheapest ? <Chip label="Menor preço" kind="ok" /> : null}
        </Row>
        <Txt v="small" muted>{[v.total ? brl(v.total) : 'Sem valor', v.ct].filter(Boolean).join(' · ')}</Txt>
        {v.st === 'ok' && v.total ? (
          <View style={{ gap: 4, maxWidth: 320 }}>
            <Progress pct={Math.round((paid / v.total) * 100)} height={5} />
            <Row gap={6}>
              <Txt v="small" muted>{brl(paid)} pago</Txt>
              {next ? (
                <Chip label={`Próxima: ${brl(next.v)} em ${fmtDate(next.due)}`} kind={next.due < t0 ? 'bad' : diffDays(fromISO(next.due), today()) <= 7 ? 'warn' : 'neutral'} />
              ) : paid >= v.total ? (
                <Chip label="Quitado" kind="ok" />
              ) : null}
            </Row>
          </View>
        ) : null}
        {v.notes ? <Txt v="small" muted numberOfLines={2}>{v.notes}</Txt> : null}
      </Pressable>
      <View style={{ width: 200 }}>
        <Select<VendorStatus> label="" value={v.st} onChange={(st) => updateEvent((e) => { const x = e.vd.find((y) => y.id === v.id); if (x) x.st = st; })} options={Object.entries(VENDOR_STATUS) as [VendorStatus, string][]} />
      </View>
    </View>
  );
}
