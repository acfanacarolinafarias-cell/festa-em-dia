import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { intOr0 } from '@/domain/money';
import { GUEST_GROUPS, GUEST_STATUS, newId } from '@/domain/templates';
import type { Guest, GuestStatus } from '@/domain/types';
import { useEvent } from '@/store/app-store';
import { Button, ConfirmButton, Field, FormGrid, Screen, Select, Txt } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

export default function GuestScreen() {
  const { id, guestId } = useLocalSearchParams<{ id: string; guestId: string }>();
  const { ev, updateEvent } = useEvent(id);
  const c = useColors();
  const isNew = guestId === 'novo';
  const existing = ev?.gl.find((g) => g.id === guestId);
  const [g, setG] = useState<Guest>(() => existing ?? { id: newId(), n: '', g: '', a: 1, k: 0, ph: '', st: 'pend', mesa: '', obs: '' });
  const [a, setA] = useState(String(g.a));
  const [k, setK] = useState(String(g.k));
  if (!ev) return null;
  const set = (patch: Partial<Guest>) => setG((x) => ({ ...x, ...patch }));
  const groups = [...new Set([...GUEST_GROUPS, ...ev.gl.map((x) => x.g).filter(Boolean)])];

  const save = () => {
    const final: Guest = { ...g, n: g.n.trim() || 'Convidado sem nome', g: g.g.trim(), a: intOr0(a), k: intOr0(k), ph: g.ph.trim(), mesa: g.mesa.trim(), obs: g.obs.trim() };
    updateEvent((e) => {
      if (isNew) e.gl.push(final);
      else e.gl = e.gl.map((x) => (x.id === final.id ? final : x));
    });
    router.back();
  };

  return (
    <Screen>
      <Field label="Nome no convite" value={g.n} onChangeText={(n) => set({ n })} placeholder="Ex.: Família Oliveira" autoFocus={isNew} />
      <View style={{ gap: 6 }}>
        <Field label="Grupo" value={g.g} onChangeText={(gr) => set({ g: gr })} placeholder="Família, Amigos…" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {groups.map((gr) => (
            <Pressable key={gr} accessibilityRole="button" onPress={() => set({ g: gr })} style={{ borderWidth: 1, borderColor: g.g === gr ? c.accent : c.line, backgroundColor: g.g === gr ? c.accentSoft : c.surface, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: g.g === gr ? c.accent : c.muted, fontSize: 13 }}>{gr}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <FormGrid>
        <Field label="Adultos" value={a} onChangeText={setA} keyboardType="number-pad" />
        <Field label="Crianças" value={k} onChangeText={setK} keyboardType="number-pad" />
        <Field label="WhatsApp" value={g.ph} onChangeText={(ph) => set({ ph })} keyboardType="phone-pad" placeholder="(11) 98888-7777" />
        <Field label="Mesa" value={g.mesa} onChangeText={(mesa) => set({ mesa })} placeholder="Ex.: 4" />
        <Select<GuestStatus> label="Resposta" value={g.st} onChange={(st) => set({ st })} options={Object.entries(GUEST_STATUS) as [GuestStatus, string][]} />
      </FormGrid>
      <Field label="Observações" value={g.obs} onChangeText={(obs) => set({ obs })} placeholder="Restrição alimentar, acessibilidade, hospedagem…" />
      <Txt v="small" muted>Um convite pode ser uma família ou um casal: informe quantas pessoas vêm nele.</Txt>
      <Button title="Salvar" kind="primary" onPress={save} />
      {!isNew ? (
        <View style={{ marginTop: space.lg }}>
          <ConfirmButton
            title="Excluir convite"
            confirmText={`Tirar ${g.n || 'este convite'} da lista?`}
            onConfirm={() => {
              updateEvent((e) => {
                e.gl = e.gl.filter((x) => x.id !== g.id);
              });
              router.back();
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}
