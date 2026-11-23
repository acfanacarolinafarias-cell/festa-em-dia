import { useState } from 'react';
import { View } from 'react-native';

import { calcDefaults, computeCalc, type CalcInput } from '@/domain/logic';
import type { AppEvent } from '@/domain/types';
import { Field, FormGrid, Select, Txt } from '@/ui/kit';
import { radius, space, useColors } from '@/ui/theme';

export function CalculatorTab({ ev }: { ev: AppEvent }) {
  const c = useColors();
  const d = calcDefaults(ev);
  const [f, setF] = useState({ adults: String(d.adults), kids: String(d.kids), hours: String(d.hours), alcohol: String(d.alcohol), kind: d.kind });
  const input: CalcInput = { adults: +f.adults || 0, kids: +f.kids || 0, hours: +f.hours || 4, alcohol: +f.alcohol || 0, kind: f.kind };
  const out = computeCalc(input);
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <View style={{ gap: space.md }}>
      <FormGrid>
        <Field label="Adultos" value={f.adults} onChangeText={set('adults')} keyboardType="number-pad" />
        <Field label="Crianças" value={f.kids} onChangeText={set('kids')} keyboardType="number-pad" />
        <Field label="Duração (horas)" value={f.hours} onChangeText={set('hours')} keyboardType="number-pad" />
        <Field label="Adultos que bebem álcool (%)" value={f.alcohol} onChangeText={set('alcohol')} keyboardType="number-pad" />
        <Select<'festa' | 'churrasco'> label="Tipo de comida" value={f.kind} onChange={(k) => setF((x) => ({ ...x, kind: k }))} options={[['festa', 'Salgados e doces'], ['churrasco', 'Churrasco']]} />
      </FormGrid>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {out.map((o) => (
          <View key={o.label} style={{ flexGrow: 1, flexBasis: '45%', minWidth: 140, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: radius, padding: space.md }}>
            <Txt v="big">{o.value}</Txt>
            <Txt v="small" muted>{o.label}</Txt>
          </View>
        ))}
      </View>
      <Txt v="small" muted>
        {ev.gl.length ? 'Os números iniciais vêm da lista de convidados (sem contar quem não vai). ' : ''}
        Estimativas com base em médias de buffets e listas de festa: ajuste para o perfil dos seus convidados e confirme com o fornecedor. Festas com mais de 4 horas aumentam as bebidas proporcionalmente.
      </Txt>
    </View>
  );
}
