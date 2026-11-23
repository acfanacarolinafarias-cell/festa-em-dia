import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { parseGuestLines } from '@/domain/logic';
import { useEvent } from '@/store/app-store';
import { Button, Field, Screen, Txt } from '@/ui/kit';

export default function ImportGuestsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ev, updateEvent } = useEvent(id);
  const [text, setText] = useState('');
  if (!ev) return null;
  const parsed = parseGuestLines(text);
  return (
    <Screen>
      <Txt muted>Cole ou digite um convite por linha. Depois do nome você pode informar, separados por ponto e vírgula: grupo; adultos; crianças; telefone.</Txt>
      <Field
        label="Convites"
        value={text}
        onChangeText={setText}
        multiline
        style={{ minHeight: 180 }}
        autoFocus
        placeholder={'Família Oliveira; Família; 3; 1; 11 98888-7777\nJoão e Ana; Amigos; 2\nPedro'}
      />
      <Button
        title={parsed.length ? `Adicionar ${parsed.length} convite${parsed.length > 1 ? 's' : ''}` : 'Adicionar à lista'}
        kind="primary"
        disabled={!parsed.length}
        onPress={() => {
          updateEvent((e) => {
            e.gl.push(...parsed);
          });
          router.back();
        }}
      />
    </Screen>
  );
}
