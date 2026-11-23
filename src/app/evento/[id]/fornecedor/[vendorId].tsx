import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { addDays, toISO, today } from '@/domain/dates';
import { splitInstallments } from '@/domain/logic';
import { brl, parseMoney } from '@/domain/money';
import { VENDOR_CATEGORIES, VENDOR_STATUS, newId } from '@/domain/templates';
import type { Payment, Vendor, VendorStatus } from '@/domain/types';
import { useEvent } from '@/store/app-store';
import { DateField } from '@/ui/date-field';
import { Button, Card, Checkbox, ConfirmButton, Field, FormGrid, Row, Screen, Select, Spacer, Txt, inputStyle } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

export default function VendorScreen() {
  const { id, vendorId } = useLocalSearchParams<{ id: string; vendorId: string }>();
  const { ev, updateEvent } = useEvent(id);
  const c = useColors();
  const isNew = vendorId === 'novo';
  const existing = ev?.vd.find((v) => v.id === vendorId);
  const [v, setV] = useState<Vendor>(() => (existing ? JSON.parse(JSON.stringify(existing)) : { id: newId(), n: '', cat: 'Buffet', st: 'orc', ct: '', total: 0, notes: '', pay: [] }));
  const [total, setTotal] = useState(existing?.total ? String(existing.total) : '');
  const [n, setN] = useState('3');
  const [firstDue, setFirstDue] = useState(toISO(addDays(today(), 30)));
  if (!ev) return null;

  const set = (patch: Partial<Vendor>) => setV((x) => ({ ...x, ...patch }));
  const setPay = (pid: string, patch: Partial<Payment>) => setV((x) => ({ ...x, pay: x.pay.map((p) => (p.id === pid ? { ...p, ...patch } : p)) }));
  const totalNum = parseMoney(total);
  const sum = v.pay.reduce((a, p) => a + p.v, 0);

  const save = () => {
    const final: Vendor = { ...v, n: v.n.trim() || 'Fornecedor sem nome', total: totalNum };
    updateEvent((e) => {
      if (isNew) e.vd.push(final);
      else e.vd = e.vd.map((x) => (x.id === final.id ? final : x));
    });
    router.back();
  };

  return (
    <Screen>
      <FormGrid>
        <Field label="Nome" value={v.n} onChangeText={(t) => set({ n: t })} placeholder="Ex.: Buffet Sabor" autoFocus={isNew} />
        <Select label="Categoria" value={v.cat} onChange={(cat) => set({ cat })} options={VENDOR_CATEGORIES.map((x) => [x, x] as [string, string])} />
        <Select<VendorStatus> label="Situação" value={v.st} onChange={(st) => set({ st })} options={Object.entries(VENDOR_STATUS) as [VendorStatus, string][]} />
        <Field label="Valor total (R$)" value={total} onChangeText={setTotal} keyboardType="decimal-pad" />
        <Field label="Contato" value={v.ct} onChangeText={(ct) => set({ ct })} placeholder="Telefone, Instagram, e-mail" />
      </FormGrid>
      <Field label="Anotações" value={v.notes} onChangeText={(notes) => set({ notes })} multiline placeholder="O que está incluso, condições, prazos do contrato…" />

      <Card>
        <Row>
          <Txt v="h3">Pagamentos</Txt>
          <Spacer />
          <Txt v="small" muted>{`${brl(sum)} de ${brl(totalNum)}`}</Txt>
        </Row>
        {totalNum && Math.abs(sum - totalNum) > 0.5 && v.pay.length ? <Txt v="small" color={c.warn}>{`Diferença de ${brl(totalNum - sum)} entre o valor total e as parcelas.`}</Txt> : null}
        {v.pay.map((p) => (
          <View key={p.id} style={{ borderTopWidth: 1, borderColor: c.line, paddingTop: space.sm, gap: space.sm }}>
            <Row>
              <TextInput value={p.d} onChangeText={(d) => setPay(p.id, { d })} style={[inputStyle(c), { flexGrow: 1, flexBasis: 140 }]} accessibilityLabel="Descrição do pagamento" />
              <TextInput defaultValue={p.v ? String(p.v) : ''} onChangeText={(t) => setPay(p.id, { v: parseMoney(t) })} keyboardType="decimal-pad" placeholder="Valor" placeholderTextColor={c.muted} style={[inputStyle(c), { width: 110 }]} accessibilityLabel="Valor do pagamento" />
            </Row>
            <Row>
              <View style={{ flexGrow: 1, flexBasis: 160 }}>
                <DateField label="Vencimento" value={p.due} onChange={(due) => setPay(p.id, { due })} />
              </View>
              <Checkbox checked={p.paid} onPress={() => setPay(p.id, { paid: !p.paid })} label="Pago" />
              <Txt v="small">Pago</Txt>
              <Button title="Remover" kind="ghost" small onPress={() => set({ pay: v.pay.filter((x) => x.id !== p.id) })} />
            </Row>
          </View>
        ))}
        <View style={{ alignItems: 'flex-start' }}>
          <Button title="+ Pagamento" small onPress={() => set({ pay: [...v.pay, { id: newId(), d: v.pay.length ? `Parcela ${v.pay.length}` : 'Sinal', v: 0, due: toISO(today()), paid: false }] })} />
        </View>
        <View style={{ borderTopWidth: 1, borderColor: c.line, paddingTop: space.sm, gap: space.sm }}>
          <Txt v="small" muted>Dividir o que falta em parcelas mensais</Txt>
          <Row style={{ alignItems: 'flex-end' }}>
            <View style={{ width: 110 }}>
              <Field label="Parcelas" value={n} onChangeText={setN} keyboardType="number-pad" />
            </View>
            <View style={{ flexGrow: 1, flexBasis: 160 }}>
              <DateField label="Primeiro vencimento" value={firstDue} onChange={setFirstDue} />
            </View>
            <Button
              title="Gerar"
              small
              disabled={!totalNum || sum >= totalNum}
              onPress={() => set({ pay: [...v.pay, ...splitInstallments({ ...v, total: totalNum }, Math.min(24, Math.max(1, parseInt(n, 10) || 1)), firstDue)] })}
            />
          </Row>
        </View>
      </Card>

      <Button title="Salvar" kind="primary" onPress={save} />
      {!isNew ? (
        <View style={{ marginTop: space.lg }}>
          <ConfirmButton
            title="Excluir fornecedor"
            confirmText={`Excluir ${v.n || 'este fornecedor'} e os pagamentos dele?`}
            onConfirm={() => {
              updateEvent((e) => {
                e.vd = e.vd.filter((x) => x.id !== v.id);
              });
              router.back();
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}
