import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { fmtLong } from '@/domain/dates';
import { eventStats, typeOf } from '@/domain/logic';
import { useStore } from '@/store/app-store';
import { Button, Chip, Empty, Progress, Row, Screen, Spacer, Txt , useTabScreenTop } from '@/ui/kit';
import { radius, space, useColors } from '@/ui/theme';

export default function EventsScreen() {
  const { state } = useStore();
  const c = useColors();
  const top = useTabScreenTop();
  const events = [...state.events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Screen contentStyle={{ paddingTop: top }}>
      <Row>
        <View style={{ flexShrink: 1 }}>
          <Txt v="eyebrow">Seus eventos</Txt>
          <Txt v="title">O que você está organizando?</Txt>
        </View>
      </Row>
      <Button title="+ Novo evento" kind="primary" onPress={() => router.push('/novo')} />

      {events.length === 0 ? (
        <Empty title="Nenhum evento ainda" text="Escolha o tipo de evento e receba um checklist com prazos calculados pela data." />
      ) : (
        events.map((ev) => {
          const s = eventStats(ev);
          return (
            <Pressable
              key={ev.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/evento/[id]', params: { id: ev.id } })}
              style={({ pressed }) => ({ backgroundColor: c.surface, borderColor: pressed ? c.accent : c.line, borderWidth: 1, borderRadius: radius, padding: space.lg, gap: space.sm })}>
              <Row>
                <Txt v="eyebrow">{typeOf(state, ev.type).n}</Txt>
                {ev.example ? <Chip label="Exemplo" kind="example" /> : null}
              </Row>
              <Txt v="h2">{ev.name}</Txt>
              <Row gap={6} style={{ alignItems: 'baseline' }}>
                <Txt v="title">{Math.abs(s.days)}</Txt>
                <Txt muted>{s.days >= 0 ? (s.days === 1 ? 'dia para o evento' : 'dias para o evento') : 'dias desde o evento'}</Txt>
              </Row>
              <Txt v="small" muted>{fmtLong(ev.date)}</Txt>
              <Progress pct={s.pct} />
              <Row>
                <Txt v="small">{s.done} de {s.total} tarefas</Txt>
                <Spacer />
                {s.late ? <Chip label={`${s.late} atrasada${s.late > 1 ? 's' : ''}`} kind="bad" /> : <Chip label="Em dia" kind="ok" />}
              </Row>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}
