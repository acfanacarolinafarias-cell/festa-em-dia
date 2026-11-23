import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { fmtDate } from '@/domain/dates';
import { DEFAULT_RSVP_MESSAGE, fillMessage, rsvpDeadline, whatsappUrl } from '@/domain/logic';
import { copyText, openUrl } from '@/features/share';
import { useEvent } from '@/store/app-store';
import { Button, Card, Field, Row, Screen, Txt } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

export default function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ev, updateEvent } = useEvent(id);
  const c = useColors();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  if (!ev) return null;
  const pending = ev.gl.filter((g) => g.st === 'pend');

  return (
    <Screen>
      <Field label="Mensagem de convite" value={ev.rsvpMsg || DEFAULT_RSVP_MESSAGE} onChangeText={(t) => updateEvent((e) => { e.rsvpMsg = t; })} multiline style={{ minHeight: 110 }} />
      <Txt v="small" muted>{`Use {nome}, {evento}, {data} e {prazo}: o app troca pelos dados de cada convidado. Prazo de resposta sugerido: ${fmtDate(rsvpDeadline(ev))}.`}</Txt>
      <View style={{ gap: 4 }}>
        <Txt v="small" muted style={{ fontWeight: '600' }}>Como o convidado vai ver</Txt>
        <View style={{ backgroundColor: c.accentSoft, borderRadius: 14, borderBottomLeftRadius: 3, padding: space.md, maxWidth: 420 }}>
          <Txt>{fillMessage(ev, ev.gl[0])}</Txt>
        </View>
      </View>
      <View style={{ alignItems: 'flex-start' }}>
        <Button title="Voltar ao texto padrão" small onPress={() => updateEvent((e) => { e.rsvpMsg = ''; })} />
      </View>
      <Card>
        <Txt v="h3">{`Quem ainda não respondeu (${pending.length})`}</Txt>
        {pending.length === 0 ? (
          <Txt muted>Todo mundo já respondeu.</Txt>
        ) : (
          pending.map((g) => (
            <Row key={g.id} style={{ borderTopWidth: 1, borderColor: c.line, paddingTop: space.sm }}>
              <View style={{ flex: 1, minWidth: 140 }}>
                <Txt style={{ fontWeight: '500' }}>{g.n}</Txt>
                <Txt v="small" muted>{g.ph || 'Sem telefone'}</Txt>
              </View>
              {g.ph ? <Button title="Enviar no WhatsApp" kind="primary" small onPress={() => openUrl(whatsappUrl(g.ph, fillMessage(ev, g)))} /> : null}
              <Button
                title={copiedId === g.id ? 'Copiado' : 'Copiar'}
                small
                onPress={async () => {
                  if (await copyText(fillMessage(ev, g))) setCopiedId(g.id);
                }}
              />
            </Row>
          ))
        )}
      </Card>
    </Screen>
  );
}
