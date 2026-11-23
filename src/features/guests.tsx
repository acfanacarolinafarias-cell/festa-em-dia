import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { fillMessage, guestTotals, peopleLabel, whatsappUrl } from '@/domain/logic';
import { GUEST_STATUS } from '@/domain/templates';
import type { AppEvent, Guest, GuestStatus } from '@/domain/types';
import { Banner, Button, Card, Chip, Empty, Field, Pills, Row, SectionHeader, Select, Spacer, Stats, Txt, inputStyle } from '@/ui/kit';
import { radius, space, useColors } from '@/ui/theme';
import { copyText, openUrl } from './share';

type View_ = 'lista' | 'mesas';
type Filter = 'todos' | GuestStatus;

export function GuestsTab({ ev, updateEvent }: { ev: AppEvent; updateEvent: (fn: (e: AppEvent) => void) => void }) {
  const [view, setView] = useState<View_>('lista');
  const T = guestTotals(ev);
  const listed = T.adults + T.kids;
  return (
    <View style={{ gap: space.md }}>
      <Stats
        items={[
          { value: String(T.invited), label: `pessoas em ${ev.gl.length} convite${ev.gl.length === 1 ? '' : 's'}` },
          { value: String(T.confirmed), label: 'confirmadas', tone: 'ok' },
          { value: String(T.pending), label: 'aguardando resposta' },
          { value: String(T.declined), label: 'não vão', tone: 'bad' },
        ]}
      />
      {ev.gl.length > 0 && listed !== ev.guests + ev.kids ? (
        <Banner tone="info">
          <Txt v="small">{`A lista soma ${T.adults} adultos e ${T.kids} crianças (sem contar quem não vai). O evento está com ${ev.guests} e ${ev.kids}.`}</Txt>
          <View style={{ alignItems: 'flex-start' }}>
            <Button title="Usar os números da lista" small onPress={() => updateEvent((e) => { e.guests = T.adults; e.kids = T.kids; })} />
          </View>
        </Banner>
      ) : null}
      <Row>
        <Pills<View_> value={view} onChange={setView} options={[['lista', 'Lista'], ['mesas', 'Mesas']]} />
        <Spacer />
        <Button title="Convite por WhatsApp" small onPress={() => router.push({ pathname: '/evento/[id]/mensagem', params: { id: ev.id } })} />
      </Row>
      {view === 'mesas' ? <TablesView ev={ev} updateEvent={updateEvent} /> : <GuestList ev={ev} updateEvent={updateEvent} />}
    </View>
  );
}

function GuestList({ ev, updateEvent }: { ev: AppEvent; updateEvent: (fn: (e: AppEvent) => void) => void }) {
  const c = useColors();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const query = q.trim().toLowerCase();
  const list = ev.gl.filter((g) => (filter === 'todos' || g.st === filter) && (!query || `${g.n} ${g.g}`.toLowerCase().includes(query)));
  const groups: Record<string, Guest[]> = {};
  list.forEach((g) => (groups[g.g || 'Sem grupo'] = groups[g.g || 'Sem grupo'] ?? []).push(g));

  return (
    <View style={{ gap: space.md }}>
      <Row>
        <Button title="+ Adicionar convite" kind="primary" small onPress={() => router.push({ pathname: '/evento/[id]/convidado/[guestId]', params: { id: ev.id, guestId: 'novo' } })} />
        <Button title="Adicionar vários" small onPress={() => router.push({ pathname: '/evento/[id]/importar', params: { id: ev.id } })} />
      </Row>
      <TextInput value={q} onChangeText={setQ} placeholder="Buscar nome ou grupo" placeholderTextColor={c.muted} style={inputStyle(c)} accessibilityLabel="Buscar convidado" />
      <Pills<Filter> scroll value={filter} onChange={setFilter} options={[['todos', 'Todos'], ['pend', 'Aguardando'], ['sim', 'Confirmados'], ['nao', 'Não vão']]} />
      {ev.gl.length === 0 ? (
        <Empty title="Sua lista ainda está vazia" text="Adicione um convite por família ou casal e informe quantos adultos e crianças vêm em cada um." />
      ) : list.length === 0 ? (
        <Txt muted>Ninguém com esse filtro.</Txt>
      ) : (
        Object.entries(groups)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([gr, gs]) => (
            <View key={gr}>
              <SectionHeader title={gr} right={`${gs.reduce((a, g) => a + g.a + g.k, 0)} pessoas`} />
              {gs.map((g) => (
                <GuestRow key={g.id} ev={ev} g={g} updateEvent={updateEvent} />
              ))}
            </View>
          ))
      )}
    </View>
  );
}

function GuestRow({ ev, g, updateEvent }: { ev: AppEvent; g: Guest; updateEvent: (fn: (e: AppEvent) => void) => void }) {
  const c = useColors();
  const [copied, setCopied] = useState(false);
  return (
    <View style={{ paddingVertical: space.md, borderBottomWidth: 1, borderColor: c.line, gap: space.sm }}>
      <Pressable accessibilityRole="button" accessibilityHint="Abre o convite para editar" onPress={() => router.push({ pathname: '/evento/[id]/convidado/[guestId]', params: { id: ev.id, guestId: g.id } })} style={{ gap: 2 }}>
        <Txt style={{ fontWeight: '500' }}>{g.n}</Txt>
        <Txt v="small" muted>{[peopleLabel(g), g.mesa ? `Mesa ${g.mesa}` : '', g.ph].filter(Boolean).join(' · ')}</Txt>
        {g.obs ? <Txt v="small" muted>{g.obs}</Txt> : null}
      </Pressable>
      <Row>
        <View style={{ width: 170 }}>
          <Select<GuestStatus> label="" value={g.st} onChange={(st) => updateEvent((e) => { const x = e.gl.find((y) => y.id === g.id); if (x) x.st = st; })} options={Object.entries(GUEST_STATUS) as [GuestStatus, string][]} />
        </View>
        {g.ph ? (
          <Button title="WhatsApp" small onPress={() => openUrl(whatsappUrl(g.ph, fillMessage(ev, g)))} />
        ) : (
          <Button title={copied ? 'Copiado' : 'Copiar convite'} small onPress={async () => setCopied(await copyText(fillMessage(ev, g)))} />
        )}
      </Row>
    </View>
  );
}

function TablesView({ ev, updateEvent }: { ev: AppEvent; updateEvent: (fn: (e: AppEvent) => void) => void }) {
  const c = useColors();
  const going = ev.gl.filter((g) => g.st !== 'nao');
  const tables: Record<string, Guest[]> = {};
  going.filter((g) => g.mesa).forEach((g) => (tables[g.mesa] = tables[g.mesa] ?? []).push(g));
  const free = going.filter((g) => !g.mesa);
  const keys = Object.keys(tables).sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0) || a.localeCompare(b));
  const count = (gs: Guest[]) => gs.reduce((a, g) => a + g.a + g.k, 0);
  const [cap, setCap] = useState(String(ev.mesaCap));

  return (
    <View style={{ gap: space.md }}>
      <Row style={{ alignItems: 'flex-end' }}>
        <View style={{ width: 160 }}>
          <Field label="Lugares por mesa" value={cap} keyboardType="number-pad" onChangeText={setCap} onEndEditing={() => updateEvent((e) => { e.mesaCap = Math.max(1, parseInt(cap, 10) || 10); })} />
        </View>
        <Txt v="small" muted style={{ flex: 1, minWidth: 160 }}>{`${keys.length} mesa${keys.length === 1 ? '' : 's'} em uso. Sugestão: ${Math.ceil(count(going) / ev.mesaCap)} mesas para ${count(going)} pessoas.`}</Txt>
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {keys.map((k) => {
          const n = count(tables[k]);
          return (
            <View key={k} style={{ flexGrow: 1, flexBasis: 160, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: radius, padding: space.md, gap: 6 }}>
              <Row>
                <Txt v="h3">Mesa {k}</Txt>
                <Spacer />
                <Chip label={`${n}/${ev.mesaCap}`} kind={n > ev.mesaCap ? 'bad' : n === ev.mesaCap ? 'ok' : 'neutral'} />
              </Row>
              {tables[k].map((g) => (
                <Row key={g.id}>
                  <Txt v="small" style={{ flex: 1 }}>{g.n}{g.st === 'pend' ? ' (aguardando)' : ''}</Txt>
                  <Txt v="small" muted>{g.a + g.k}</Txt>
                </Row>
              ))}
            </View>
          );
        })}
      </View>
      <Card>
        <Txt v="h3">{`Sem mesa (${count(free)} pessoas)`}</Txt>
        {free.length === 0 ? (
          <Txt muted>Todos os convidados que vão já têm mesa.</Txt>
        ) : (
          free.map((g) => <AssignRow key={g.id} g={g} onAssign={(m) => updateEvent((e) => { const x = e.gl.find((y) => y.id === g.id); if (x) x.mesa = m; })} />)
        )}
      </Card>
    </View>
  );
}

function AssignRow({ g, onAssign }: { g: Guest; onAssign: (mesa: string) => void }) {
  const c = useColors();
  const [v, setV] = useState('');
  return (
    <Row style={{ borderTopWidth: 1, borderColor: c.line, paddingTop: space.sm }}>
      <View style={{ flex: 1, minWidth: 140 }}>
        <Txt style={{ fontWeight: '500' }}>{g.n}</Txt>
        <Txt v="small" muted>{`${peopleLabel(g)} · ${g.g || 'Sem grupo'}`}</Txt>
      </View>
      <TextInput value={v} onChangeText={setV} placeholder="Mesa nº" placeholderTextColor={c.muted} style={[inputStyle(c), { width: 90 }]} accessibilityLabel={`Mesa de ${g.n}`} onSubmitEditing={() => v.trim() && onAssign(v.trim())} returnKeyType="done" />
      <Button title="OK" small disabled={!v.trim()} onPress={() => onAssign(v.trim())} />
    </Row>
  );
}
