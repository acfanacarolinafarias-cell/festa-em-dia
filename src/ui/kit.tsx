import { Children, useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useColors, type Palette } from './theme';

/* ---------- Texto ---------- */

type TxtVariant = 'title' | 'h2' | 'h3' | 'body' | 'small' | 'eyebrow' | 'big';
export function Txt({ v = 'body', muted, color, style, ...rest }: TextProps & { v?: TxtVariant; muted?: boolean; color?: string }) {
  const c = useColors();
  return <Text style={[textStyles[v], { color: color ?? (muted || v === 'eyebrow' ? c.muted : c.text) }, style]} {...rest} />;
}
const textStyles = StyleSheet.create({
  title: { fontSize: 28, lineHeight: 33, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 20, lineHeight: 25, fontWeight: '700' },
  h3: { fontSize: 16, lineHeight: 21, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21 },
  small: { fontSize: 13, lineHeight: 18 },
  eyebrow: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' },
  big: { fontSize: 24, lineHeight: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

/* ---------- Layout ---------- */

/** Telas das abas: no celular a barra fica embaixo; na web ela fica no topo e precisa de espaço. */
export function useTabScreenTop() {
  const insets = useSafeAreaInsets();
  return insets.top + space.lg + (Platform.OS === 'web' ? 56 : 0);
}

export function Screen({ children, contentStyle }: { children: ReactNode; contentStyle?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ padding: space.lg, paddingBottom: insets.bottom + 48, gap: space.lg, maxWidth: 820, width: '100%', alignSelf: 'center' }, contentStyle]}>
      {children}
    </ScrollView>
  );
}

export function Row({ children, gap = space.sm, wrap = true, style }: { children: ReactNode; gap?: number; wrap?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>;
}
export const Spacer = () => <View style={{ flex: 1 }} />;

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: radius, padding: space.lg, gap: space.md }, style]}>{children}</View>;
}

export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm, paddingTop: space.md, paddingBottom: space.sm, borderBottomWidth: 1, borderColor: c.line }}>
      <Txt v="h3" style={{ flexShrink: 1 }}>{title}</Txt>
      <Spacer />
      {typeof right === 'string' ? <Txt v="small" muted>{right}</Txt> : right}
    </View>
  );
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.line, borderRadius: radius, padding: space.xl, alignItems: 'center', gap: space.sm }}>
      <Txt v="h3" style={{ textAlign: 'center' }}>{title}</Txt>
      <Txt muted style={{ textAlign: 'center' }}>{text}</Txt>
      {action}
    </View>
  );
}

/* ---------- Botões ---------- */

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Button({ title, onPress, kind = 'secondary', small, disabled, style }: { title: string; onPress: () => void; kind?: BtnKind; small?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const bg = kind === 'primary' ? c.accent : kind === 'ghost' ? 'transparent' : c.surface;
  const border = kind === 'primary' ? c.accent : kind === 'danger' ? c.bad : kind === 'ghost' ? 'transparent' : c.line;
  const fg = kind === 'primary' ? c.onAccent : kind === 'danger' ? c.bad : kind === 'ghost' ? c.accent : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { backgroundColor: bg, borderColor: border, borderWidth: 1, borderRadius: 8, paddingVertical: small ? 6 : 10, paddingHorizontal: small ? 10 : 16, opacity: disabled ? 0.5 : pressed ? 0.75 : 1, alignItems: 'center' },
        style,
      ]}>
      <Text style={{ color: fg, fontWeight: '600', fontSize: small ? 13 : 15 }}>{title}</Text>
    </Pressable>
  );
}

/** Botão de exclusão em dois toques (Alert não funciona igual em todas as plataformas). */
export function ConfirmButton({ title, confirmText, onConfirm }: { title: string; confirmText: string; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  const c = useColors();
  if (!asking) return <Button title={title} kind="danger" small onPress={() => setAsking(true)} />;
  return (
    <View style={{ backgroundColor: c.badSoft, borderRadius: 8, padding: space.md, gap: space.sm }}>
      <Txt v="small">{confirmText}</Txt>
      <Row>
        <Button title="Confirmar" kind="danger" small onPress={onConfirm} />
        <Button title="Cancelar" small onPress={() => setAsking(false)} />
      </Row>
    </View>
  );
}

/* ---------- Indicadores ---------- */

export type ChipKind = 'neutral' | 'ok' | 'bad' | 'warn' | 'example';
export function Chip({ label, kind = 'neutral' }: { label: string; kind?: ChipKind }) {
  const c = useColors();
  const map: Record<ChipKind, [string, string]> = {
    neutral: [c.sunk, c.muted],
    ok: [c.accentSoft, c.accent],
    bad: [c.badSoft, c.bad],
    warn: [c.warnSoft, c.warn],
    example: [c.blush, c.blushText],
  };
  const [bg, fg] = map[kind];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function Progress({ pct, height = 6, color }: { pct: number; height?: number; color?: string }) {
  const c = useColors();
  return (
    <View style={{ height, backgroundColor: c.sunk, borderRadius: 999, overflow: 'hidden' }} accessibilityLabel={`${pct}% concluído`}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', backgroundColor: color ?? c.accent, borderRadius: 999 }} />
    </View>
  );
}

export function Stats({ items }: { items: { value: string; label: string; tone?: 'bad' | 'ok' }[] }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexGrow: 1, flexBasis: '45%', minWidth: 140, backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: radius, padding: space.md }}>
          <Txt v="big" color={it.tone === 'bad' ? c.bad : it.tone === 'ok' ? c.accent : undefined}>{it.value}</Txt>
          <Txt v="small" muted>{it.label}</Txt>
        </View>
      ))}
    </View>
  );
}

export function Banner({ children, tone = 'warn' }: { children: ReactNode; tone?: 'warn' | 'info' }) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: tone === 'warn' ? c.warnSoft : c.accentSoft, borderLeftWidth: 3, borderColor: tone === 'warn' ? c.warn : c.accent, borderRadius: 8, padding: space.md, gap: space.sm }}>
      {typeof children === 'string' ? <Txt v="small">{children}</Txt> : children}
    </View>
  );
}

export function Checkbox({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: checked ? c.accent : c.line, backgroundColor: checked ? c.accent : c.surface, alignItems: 'center', justifyContent: 'center' }}>
      {checked ? <Text style={{ color: c.onAccent, fontWeight: '800', fontSize: 14, lineHeight: 16 }}>✓</Text> : null}
    </Pressable>
  );
}

/** Controle segmentado / filtros em pílula. */
export function Pills<T extends string>({ options, value, onChange, scroll }: { options: [T, string][]; value: T; onChange: (v: T) => void; scroll?: boolean }) {
  const c = useColors();
  const content = options.map(([k, l]) => {
    const on = k === value;
    return (
      <Pressable
        key={k}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        onPress={() => onChange(k)}
        style={{ borderWidth: 1, borderColor: on ? c.text : c.line, backgroundColor: on ? c.text : c.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
        <Text style={{ color: on ? c.bg : c.text, fontWeight: '500', fontSize: 14 }}>{l}</Text>
      </Pressable>
    );
  });
  if (scroll)
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {content}
      </ScrollView>
    );
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{content}</View>;
}

/** Abas do evento: rolam na horizontal em telas estreitas. */
export function Tabs<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  const c = useColors();
  return (
    <View style={{ borderBottomWidth: 1, borderColor: c.line }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(([k, l]) => {
          const on = k === value;
          return (
            <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(k)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderColor: on ? c.accent : 'transparent' }}>
              <Text style={{ color: on ? c.accent : c.muted, fontWeight: '600', fontSize: 15 }}>{l}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ---------- Formulários ---------- */

export function inputStyle(c: Palette) {
  return { borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: c.text } as const;
}

export function Field({ label, style, ...rest }: TextInputProps & { label: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 4 }}>
      <Txt v="small" muted style={{ fontWeight: '600' }}>{label}</Txt>
      <TextInput placeholderTextColor={c.muted} style={[inputStyle(c), rest.multiline ? { minHeight: 70, textAlignVertical: 'top' } : null, style]} accessibilityLabel={label} {...rest} />
    </View>
  );
}

/** Grade de campos: dois por linha em telas largas, um por linha no celular estreito. */
export function FormGrid({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
      {Children.toArray(children).map((ch, i) => (
        <View key={i} style={{ flexGrow: 1, flexBasis: 160, minWidth: 0 }}>
          {ch}
        </View>
      ))}
    </View>
  );
}

/** Seletor simples: abre uma lista em modal. Funciona igual em iOS, Android e web. */
export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const current = options.find(([k]) => k === value)?.[1] ?? value;
  return (
    <View style={{ gap: 4 }}>
      {label ? <Txt v="small" muted style={{ fontWeight: '600' }}>{label}</Txt> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${current}`} onPress={() => setOpen(true)} style={[inputStyle(c), { flexDirection: 'row', alignItems: 'center' }]}>
        <Text style={{ color: c.text, fontSize: 15, flex: 1 }} numberOfLines={1}>{current}</Text>
        <Text style={{ color: c.muted, marginLeft: 6 }}>▾</Text>
      </Pressable>
      {open ? (
      <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }} onPress={() => setOpen(false)}>
          <Pressable style={{ backgroundColor: c.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', paddingBottom: insets.bottom + 8, width: '100%', maxWidth: 640, alignSelf: 'center' }} onPress={() => {}}>
            <View style={{ padding: space.lg, borderBottomWidth: 1, borderColor: c.line }}>
              <Txt v="h3">{label || 'Escolha'}</Txt>
            </View>
            <ScrollView>
              {options.map(([k, l]) => (
                <Pressable
                  key={k}
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(k);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({ paddingHorizontal: space.lg, paddingVertical: 14, backgroundColor: k === value ? c.accentSoft : pressed ? c.sunk : 'transparent' })}>
                  <Text style={{ color: k === value ? c.accent : c.text, fontSize: 16, fontWeight: k === value ? '600' : '400' }}>{l}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      ) : null}
    </View>
  );
}
