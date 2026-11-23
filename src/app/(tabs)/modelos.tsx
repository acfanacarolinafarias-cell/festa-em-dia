import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { allTypes, getTemplate, isTemplateEdited, typeOf } from '@/domain/logic';
import { CATEGORIES, PHASES, newId } from '@/domain/templates';
import type { CategoryId, PhaseId, TemplateTask } from '@/domain/types';
import { useStore } from '@/store/app-store';
import { Button, Card, Chip, ConfirmButton, Field, Row, Screen, SectionHeader, Select, Spacer, Txt, inputStyle , useTabScreenTop } from '@/ui/kit';
import { space, useColors } from '@/ui/theme';

export default function TemplatesScreen() {
  const { state, update } = useStore();
  const top = useTabScreenTop();
  const types = allTypes(state);
  const [typeId, setTypeId] = useState('casamento');
  const [creating, setCreating] = useState(false);
  const t = typeOf(state, types.some((x) => x.id === typeId) ? typeId : 'casamento');
  const tpl = getTemplate(state, t.id);
  const edited = isTemplateEdited(state, t.id);

  const save = (list: TemplateTask[]) =>
    update((s) => {
      s.templates[t.id] = list;
    });
  const change = (taskId: string, patch: Partial<TemplateTask>) => save(tpl.map((x) => (x.id === taskId ? { ...x, ...patch } : x)));

  return (
    <Screen contentStyle={{ paddingTop: top }}>
      <View>
        <Txt v="eyebrow">Modelos</Txt>
        <Txt v="title">Checklists padrão</Txt>
        <Txt muted>Ajuste as tarefas que cada tipo de evento recebe ao ser criado. As mudanças valem para os próximos eventos; eventos já criados não mudam.</Txt>
      </View>
      <Select label="Modelo" value={t.id} onChange={setTypeId} options={types.map((x) => [x.id, x.n + (isTemplateEdited(state, x.id) ? ' (editado)' : '')] as [string, string])} />
      {creating ? (
        <NewTemplateForm
          onCancel={() => setCreating(false)}
          onCreate={(name, base) => {
            const id = 'u' + newId();
            update((s) => {
              s.customTypes.push({ id, name, lead: base ? typeOf(s, base).lead : 60 });
              s.templates[id] = base ? getTemplate(s, base).map((x) => ({ ...x, id: newId() })) : [];
            });
            setTypeId(id);
            setCreating(false);
          }}
        />
      ) : (
        <View style={{ alignItems: 'flex-start' }}>
          <Button title="+ Criar modelo próprio" small onPress={() => setCreating(true)} />
        </View>
      )}

      <Card>
        <Row>
          <Txt v="h2">{t.n}</Txt>
          {edited ? <Chip label="Editado" kind="warn" /> : null}
          {t.custom ? <Chip label="Seu modelo" kind="example" /> : null}
          <Spacer />
          <Txt v="small" muted>{tpl.length} tarefas</Txt>
        </Row>
        {PHASES.map((p) => {
          const rows = tpl.filter((x) => x.p === p.id);
          return (
            <View key={p.id}>
              <SectionHeader title={p.label} right={String(rows.length)} />
              {rows.map((x) => (
                <TemplateRow key={x.id} task={x} onChange={(patch) => change(x.id, patch)} onRemove={() => save(tpl.filter((y) => y.id !== x.id))} />
              ))}
              <View style={{ alignItems: 'flex-start', paddingVertical: 4 }}>
                <Button title={`+ Adicionar em ${p.label.toLowerCase()}`} kind="ghost" small onPress={() => save([...tpl, { id: newId(), t: 'Nova tarefa', c: 'pl', p: p.id }])} />
              </View>
            </View>
          );
        })}
        <View style={{ gap: space.sm, paddingTop: space.sm }}>
          <Button title="Criar evento com este modelo" kind="primary" onPress={() => router.push({ pathname: '/novo', params: { tipo: t.id } })} />
          {edited ? (
            <ConfirmButton title="Restaurar modelo original" confirmText={`Voltar ${t.n} para a lista original? Suas mudanças neste modelo serão perdidas.`} onConfirm={() => update((s) => { delete s.templates[t.id]; })} />
          ) : null}
          {t.custom ? (
            <ConfirmButton
              title="Excluir este modelo"
              confirmText={`Excluir o modelo ${t.n}? Eventos criados com ele continuam existindo.`}
              onConfirm={() => {
                update((s) => {
                  s.customTypes = s.customTypes.filter((c) => c.id !== t.id);
                  delete s.templates[t.id];
                });
                setTypeId('casamento');
              }}
            />
          ) : null}
        </View>
      </Card>
    </Screen>
  );
}

function TemplateRow({ task, onChange, onRemove }: { task: TemplateTask; onChange: (p: Partial<TemplateTask>) => void; onRemove: () => void }) {
  const c = useColors();
  const [text, setText] = useState(task.t);
  return (
    <View style={{ paddingVertical: space.sm, gap: 6, borderBottomWidth: 1, borderColor: c.line }}>
      <TextInput
        value={text}
        onChangeText={setText}
        onEndEditing={() => text.trim() !== task.t && onChange({ t: text.trim() || 'Nova tarefa' })}
        onBlur={() => text.trim() !== task.t && onChange({ t: text.trim() || 'Nova tarefa' })}
        style={inputStyle(c)}
        accessibilityLabel="Tarefa"
      />
      <Row>
        <View style={{ flexGrow: 1, flexBasis: 130 }}>
          <Select<CategoryId> label="" value={task.c} onChange={(cat) => onChange({ c: cat })} options={Object.entries(CATEGORIES) as [CategoryId, string][]} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 130 }}>
          <Select<PhaseId> label="" value={task.p} onChange={(p) => onChange({ p })} options={PHASES.map((p) => [p.id, p.label] as [PhaseId, string])} />
        </View>
        <Button title="Remover" kind="ghost" small onPress={onRemove} />
      </Row>
    </View>
  );
}

function NewTemplateForm({ onCreate, onCancel }: { onCreate: (name: string, base: string) => void; onCancel: () => void }) {
  const { state } = useStore();
  const [name, setName] = useState('');
  const [base, setBase] = useState('');
  return (
    <Card>
      <Field label="Nome do modelo" value={name} onChangeText={setName} placeholder="Ex.: Festa junina da família" autoFocus />
      <Select label="Começar a partir de" value={base} onChange={setBase} options={[['', 'Lista em branco'], ...allTypes(state).map((x) => [x.id, x.n] as [string, string])]} />
      <Row>
        <Button title="Criar modelo" kind="primary" small disabled={!name.trim()} onPress={() => onCreate(name.trim(), base)} />
        <Button title="Cancelar" small onPress={onCancel} />
      </Row>
    </Card>
  );
}
