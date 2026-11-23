import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, Text, View } from 'react-native';

import { fmtDate, fromISO, toISO } from '@/domain/dates';
import { Txt, inputStyle } from './kit';
import { useColors } from './theme';

/** Campo de data com o seletor nativo do sistema (iOS e Android). */
export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (iso: string) => void }) {
  const c = useColors();
  return (
    <View style={{ gap: 4 }}>
      <Txt v="small" muted style={{ fontWeight: '600' }}>{label}</Txt>
      {Platform.OS === 'ios' ? (
        <View style={{ alignItems: 'flex-start' }}>
          <DateTimePicker value={fromISO(value)} mode="date" display="compact" locale="pt-BR" accentColor={c.accent} onValueChange={(_, d) => onChange(toISO(d))} />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${fmtDate(value)}`}
          style={inputStyle(c)}
          onPress={() => DateTimePickerAndroid.open({ value: fromISO(value), mode: 'date', onValueChange: (_, d) => onChange(toISO(d)) })}>
          <Text style={{ color: c.text, fontSize: 15 }}>{fmtDate(value)}</Text>
        </Pressable>
      )}
    </View>
  );
}
