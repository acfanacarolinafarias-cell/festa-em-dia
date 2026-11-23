import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { fmtInput, parseInput } from '@/domain/dates';
import { Txt, inputStyle } from './kit';
import { useColors } from './theme';

/** Na web, a data é digitada como DD/MM/AAAA. */
export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (iso: string) => void }) {
  const c = useColors();
  const [text, setText] = useState(fmtInput(value));
  // Quando a data muda por fora (ex.: troca de etapa), atualiza o texto.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(fmtInput(value));
  }
  const bad = text.length >= 8 && !parseInput(text);
  return (
    <View style={{ gap: 4 }}>
      <Txt v="small" muted style={{ fontWeight: '600' }}>{label}</Txt>
      <TextInput
        accessibilityLabel={label}
        value={text}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={c.muted}
        inputMode="numeric"
        style={[inputStyle(c), bad ? { borderColor: c.bad } : null]}
        onChangeText={(t) => {
          setText(t);
          const iso = parseInput(t);
          if (iso) onChange(iso);
        }}
      />
    </View>
  );
}
